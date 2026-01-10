
// Simple XML-like markup converter

export const jsonToMarkup = (layoutData) => {
    if (!layoutData || !layoutData.pages) return '';

    let markup = '<Document>\n';

    layoutData.pages.forEach((page, pageIndex) => {
        markup += `  <Page number="${pageIndex + 1}" width="${page.width}" height="${page.height}">\n`;

        page.items.forEach(item => {
            // Escape special characters
            const content = item.text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            markup += `    <Text x="${item.x.toFixed(2)}" y="${item.y.toFixed(2)}" size="${item.fontSize.toFixed(2)}" fontFamily="${item.fontName}">\n`;
            markup += `      ${content}\n`;
            markup += `    </Text>\n`;
        });

        markup += `  </Page>\n`;
    });

    markup += '</Document>';
    return markup;
};

export const markupToJson = (markupString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(markupString, "text/xml");

    const pages = [];
    const pageNodes = xmlDoc.getElementsByTagName("Page");

    for (let i = 0; i < pageNodes.length; i++) {
        const pageNode = pageNodes[i];
        const width = parseFloat(pageNode.getAttribute("width"));
        const height = parseFloat(pageNode.getAttribute("height"));
        const items = [];

        const textNodes = pageNode.getElementsByTagName("Text");
        for (let j = 0; j < textNodes.length; j++) {
            const textNode = textNodes[j];
            items.push({
                x: parseFloat(textNode.getAttribute("x")),
                y: parseFloat(textNode.getAttribute("y")),
                fontSize: parseFloat(textNode.getAttribute("size")),
                fontName: textNode.getAttribute("fontFamily") || 'Helvetica',
                text: textNode.textContent.trim()
            });
        }

        pages.push({
            width,
            height,
            items
        });
    }

    return { pages };
};
