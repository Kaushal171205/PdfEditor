import { pdfjs } from 'react-pdf';

// Configure worker - assuming standard react-pdf setup, but might need adjustment for Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const extractLayout = async (pdfFile) => {
    try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;

        const pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });
            const textContent = await page.getTextContent();

            const items = textContent.items.map(item => {
                // PDF coordinates start from bottom-left, but we usually want top-left for web
                // However, pdf-lib also uses bottom-left by default, but let's stick to keeping standard PDF coords for now
                // Or normalize to top-left? Let's check item.transform.
                // item.transform is [scaleX, skewY, skewX, scaleY, transX, transY]
                // transY is from bottom-left usually.

                // For simplicity in the markup, we'll store what we get, but might need normalization.
                // Let's store raw values first.

                return {
                    text: item.str,
                    x: item.transform[4],
                    y: item.transform[5], // This is usually from bottom-left
                    fontSize: item.transform[0], // Approximate font size from scaleY
                    fontName: item.fontName,
                    width: item.width,
                    height: item.height
                };
            });

            // Post-process items to merge adjacent text
            items.sort((a, b) => {
                // Sort by Y (descending for top-down, but PDF is bottom-up usually)
                // Let's sort effectively by lines. 
                // Using a tolerance for Y to group lines.
                if (Math.abs(b.y - a.y) > 2) {
                    return b.y - a.y; // Sort top-to-bottom (higher Y first in PDF usually? No, PDF 0,0 is bottom-left. So higher Y is top.)
                    // Actually usually PDF text comes in correct order, but let's be safe.
                    // Wait, standard PDF coords: usually Y increases upwards. So higher Y is higher up on the page.
                }
                return a.x - b.x; // Sort left-to-right
            });

            const mergedItems = [];
            let currentItem = null;

            for (const item of items) {
                if (!item.text.trim()) continue; // Skip pure whitespace for now? Or keep? Let's keep meaningful whitespace if it's separators.
                // Actually empty STR usually means spacing in PDF if width > 0.

                if (!currentItem) {
                    currentItem = { ...item };
                    continue;
                }

                // Check if we should merge
                const yDiff = Math.abs(item.y - currentItem.y);
                const sameLine = yDiff < 2; // 2px tolerance
                const xDiff = item.x - (currentItem.x + currentItem.width);
                const isClose = xDiff > -2 && xDiff < (currentItem.fontSize * 0.6); // Allow slight overlap or small gap
                const sameStyle = item.fontName === currentItem.fontName && Math.abs(item.fontSize - currentItem.fontSize) < 1;

                if (sameLine && isClose && sameStyle) {
                    // Merge
                    currentItem.text += item.text;
                    currentItem.width += item.width + xDiff; // Accurate width update
                } else {
                    // Push current and start new
                    mergedItems.push(currentItem);
                    currentItem = { ...item };
                }
            }
            if (currentItem) {
                mergedItems.push(currentItem);
            }

            pages.push({
                pageNumber: i,
                width: viewport.width,
                height: viewport.height,
                items: mergedItems
            });
        }

        return { pages };
    } catch (error) {
        console.error("Error extracting PDF layout:", error);
        throw error;
    }
};
