import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export const generatePDF = async (layoutData) => {
    try {
        const pdfDoc = await PDFDocument.create();

        // Register fontkit
        pdfDoc.registerFontkit(fontkit);

        // Fetch and embed a Unicode-compatible font (Ubuntu)
        // We use a CDN to get the font file
        const fontBytes = await fetch('https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf').then((res) => res.arrayBuffer());
        const customFont = await pdfDoc.embedFont(fontBytes);

        for (const pageData of layoutData.pages) {
            const page = pdfDoc.addPage([pageData.width, pageData.height]);

            for (const item of pageData.items) {
                page.drawText(item.text, {
                    x: item.x,
                    y: item.y,
                    size: item.fontSize,
                    font: customFont,
                    color: rgb(0, 0, 0),
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
};
