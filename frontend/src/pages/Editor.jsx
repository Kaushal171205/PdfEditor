import { useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb } from 'pdf-lib';
import styles from './Editor.module.css';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  `react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs`,
  import.meta.url
).toString();

function Editor() {
  const location = useLocation();
  const { pdfFile } = location.state || {};

  const [numPages, setNumPages] = useState(null);

  const textItemsRef = useRef({});
  const pageScalesRef = useRef({});

  // { [id]: { page, x, y, width, height, fontSize, originalText, text } }
  const [edits, setEdits] = useState({});

  // { [id]: { page, x, y, width, height, dataUrl, type } }
  const [images, setImages] = useState({});
  const [selectedImageId, setSelectedImageId] = useState(null);

  // Dragging state
  const dragRef = useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // 1️⃣ LOAD TEXT + STORE VIEWPORT INFO
  const handlePageLoad = async (page) => {
    const viewport = page.getViewport({ scale: 1 });
    // Store original viewport dimensions (PDF units) to calculate scaling ratio later
    pageScalesRef.current[page.pageNumber] = {
      width: viewport.width,
      height: viewport.height,
    };

    const textContent = await page.getTextContent();

    textItemsRef.current[page.pageNumber] = textContent.items.map(item => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width,
      height: item.height,
      fontSize: item.height, // Use height as approximation for font size if not available
    }));
  };

  // 2️⃣ CLICK → PDF COORDS (ROBUST RATIO SCALING)
  const handlePdfClick = (e, pageNumber) => {
    // If clicking an image, don't trigger text selection
    if (e.target.closest(`.${styles.imageWrapper}`)) return;

    // Deselect image
    setSelectedImageId(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const pdfViewport = pageScalesRef.current[pageNumber];

    if (!pdfViewport) return;

    // Calculate dynamic ratio: How many PDF units per CSS pixel?
    const scaleX = pdfViewport.width / rect.width;
    const scaleY = pdfViewport.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (rect.bottom - e.clientY) * scaleY; // PDF y is from bottom-left

    const items = textItemsRef.current[pageNumber];
    if (!items) return;

    const HIT_PADDING = 5; // Allow for imprecise clicking (in PDF units)

    const clickedItem = items.find(item =>
      clickX >= item.x - HIT_PADDING &&
      clickX <= item.x + item.width + HIT_PADDING &&
      clickY >= item.y - item.height - HIT_PADDING && // Check full height including possible descent
      clickY <= item.y + HIT_PADDING
    );

    if (clickedItem) {
      const id = `p${pageNumber}_x${clickedItem.x}_y${clickedItem.y}`;
      if (!edits[id]) {
        setEdits(prev => ({
          ...prev,
          [id]: {
            page: pageNumber,
            x: clickedItem.x,
            y: clickedItem.y,
            width: clickedItem.width,
            height: clickedItem.height,
            fontSize: clickedItem.fontSize,
            originalText: clickedItem.text,
            text: clickedItem.text,
          }
        }));
      }
    }
  };

  const handleChange = (id, newText) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        text: newText
      }
    }));
  };

  // --- IMAGE HANDLING START ---

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const id = `img_${Date.now()}`;

      const pageToAddTo = numPages > 0 ? 1 : 1;

      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const initialWidth = 200;
        const initialHeight = 200 / aspectRatio;

        setImages(prev => ({
          ...prev,
          [id]: {
            id,
            page: pageToAddTo,
            x: 50,
            y: 500,
            width: initialWidth,
            height: initialHeight,
            dataUrl,
            type: file.type,
          }
        }));
        setSelectedImageId(id);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const startDrag = (e, id, type) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImageId(id);

    const image = images[id];
    dragRef.current = {
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: image.x,
      initialY: image.y,
      initialWidth: image.width,
      initialHeight: image.height,
      pageViewport: pageScalesRef.current[image.page],
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragRef.current) return;

      const { type, id, startX, startY, initialX, initialY, initialWidth, initialHeight, pageViewport } = dragRef.current;

      const pageContainer = document.querySelectorAll(`.${styles.pageCanvas}`)[images[id].page - 1]; // 0-indexed
      if (!pageContainer) return;

      const rect = pageContainer.getBoundingClientRect();
      const scaleX = pageViewport.width / rect.width;
      const scaleY = pageViewport.height / rect.height;

      const deltaX = (e.clientX - startX) * scaleX;
      const deltaY = (e.clientY - startY) * scaleY;

      if (type === 'move') {
        setImages(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            x: initialX + deltaX,
            y: initialY - deltaY,
          }
        }));
      } else if (type === 'resize') {
        const newWidth = Math.max(20, initialWidth + deltaX);
        const newHeight = Math.max(20, initialHeight - deltaY * -1);

        setImages(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            width: newWidth,
            height: newHeight,
          }
        }));
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [images]);

  // --- IMAGE HANDLING END ---

  // 4️⃣ SAVE PDF (pdf-lib)
  const handleSavePdf = async () => {
    const buffer = await pdfFile.arrayBuffer();
    const pdfBytes = new Uint8Array(buffer);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // 1. Text Edits
    Object.values(edits).forEach(edit => {
      const page = pages[edit.page - 1];
      const { x, y, width, height, fontSize, text } = edit;

      // Robust Erasure Math:
      // Flatten the erasure area a bit more to ensure we cover everything.
      // Descent is usually 0.2-0.3 of font size. We use 0.3 to be safe.
      const descent = height * 0.3;

      // Cover old text with white rectangle
      page.drawRectangle({
        x: x - 2,
        y: y - descent,
        width: width + 6, // Wider padding
        height: height + descent + 4, // Taller padding
        color: rgb(1, 1, 1),
      });

      // Draw new text
      page.drawText(text, {
        x: x,
        y: y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    });

    // 2. Images
    for (const imgData of Object.values(images)) {
      const page = pages[imgData.page - 1];
      let pdfImage;
      if (imgData.type === 'image/png') {
        pdfImage = await pdfDoc.embedPng(imgData.dataUrl);
      } else {
        pdfImage = await pdfDoc.embedJpg(imgData.dataUrl);
      }

      page.drawImage(pdfImage, {
        x: imgData.x,
        y: imgData.y, // Fixed: y is already the bottom coordinate (from CSS 'bottom')
        width: imgData.width,
        height: imgData.height,
      });
    }

    const editedPdfBytes = await pdfDoc.save();

    const blob = new Blob([editedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.pdf';
    a.click();
  };

  if (!pdfFile) {
    return <p>No PDF received</p>;
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {pdfFile.name}
          <label className={styles.saveBtn} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            Add Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.hiddenInput}
            />
          </label>
        </div>
        <button onClick={handleSavePdf} className={styles.saveBtn}>
          Save PDF
        </button>
      </div>

      <div className={styles.pdfViewer}>
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from({ length: numPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <div key={index} className={styles.pdfPage}>
                <div
                  className={styles.pageCanvas}
                  onClick={(e) => handlePdfClick(e, pageNumber)}
                >
                  <Page
                    pageNumber={pageNumber}
                    onLoadSuccess={handlePageLoad}
                  />

                  {/* Render Edits */}
                  {Object.entries(edits).map(([id, edit]) => {
                    if (edit.page !== pageNumber) return null;
                    return (
                      <input
                        key={id}
                        autoFocus
                        value={edit.text}
                        onChange={(e) => handleChange(id, e.target.value)}
                        className={styles.editInput}
                        style={{
                          position: 'absolute',
                          left: `${edit.x}px`,
                          // Fix CSS positioning:
                          // edit.y is distance from bottom (pdf coords).
                          // To align input baseline with text baseline, we need to respect the descent.
                          // 'bottom' CSS puts the bottom edge of the input at that pixel value.
                          // Ideally, bottom edge = baseline - descent.
                          bottom: `${edit.y - (edit.height * 0.2)}px`,
                          fontSize: `${edit.fontSize}px`,
                          width: `${edit.width + 20}px`, // Extra space for typing
                          height: `${edit.height * 1.4}px`, // Input needs to be taller than font size to avoid scroll bars
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    );
                  })}

                  {/* Render Images */}
                  {Object.values(images).map((img) => {
                    if (img.page !== pageNumber) return null;
                    const isSelected = selectedImageId === img.id;
                    return (
                      <div
                        key={img.id}
                        className={`${styles.imageWrapper} ${isSelected ? styles.imageSelected : ''}`}
                        style={{
                          left: `${img.x}px`,
                          bottom: `${img.y}px`,
                          width: `${img.width}px`,
                          height: `${img.height}px`,
                        }}
                        onMouseDown={(e) => startDrag(e, img.id, 'move')}
                      >
                        <img
                          src={img.dataUrl}
                          alt="pdf-insert"
                          style={{ width: '100%', height: '100%', pointerEvents: 'none', display: 'block' }}
                        />
                        {isSelected && (
                          <div
                            className={styles.resizer}
                            onMouseDown={(e) => startDrag(e, img.id, 'resize')}
                          />
                        )}
                      </div>
                    );
                  })}

                </div>
              </div>
            );
          })}
        </Document>
      </div>

      <div className={styles.pageInfo}>
        Total Pages: {numPages}
      </div>
    </div>
  );
}

export default Editor;
