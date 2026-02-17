Project Overview: PDF Editor
This project is a React-based PDF manipulation tool that offers two distinct ways to edit PDF documents: a Visual Editor for direct manipulation and a Code Editor for structural editing.

🏗️ Architecture & Tech Stack
Frontend Framework: React 19 + Vite (for fast development and building).
Routing: react-router-dom (handling navigation between Home, Editors, etc.).
PDF Core Libraries:
react-pdf: Used for rendering PDF pages in the browser (Visual Editor).
pdf-lib: Used for modifying and generating PDFs (saving changes, creating new PDFs).
pdfjs-dist: Used for parsing PDF text content and layout data (Code Editor).
🚀 Key Workflows
1. Visual Editor (/editor)
Goal: Edit text and add images directly on the PDF page, WYSIWYG style.

Rendering:

The 
Editor.jsx
 component uses react-pdf to render each page of the PDF.
It overlays a click interaction layer on top of the rendered page.
Text Editing Logic:

When you click on text, the app calculates the click coordinates relative to the PDF's internal viewport.
It searches the extracted text items (loaded via pdf.getTextContent()) to find the closest text block.
An <input> field is dynamically overlaid at that exact position, matching the font size and dimensions.
State: Edits are stored in a local state object edits = { [id]: { page, x, y, text, ... } }.
Image & Media Logic:

Images are uploaded via FileReader and stored as Data URLs.
They are rendered as draggable/resizable DOM elements on top of the PDF.
Saving (The "Magic"):

The app loads the original PDF using pdf-lib.
For every text edit:
It draws a white rectangle over the original text to "erase" it (since PDFs are immutable streams).
It draws the new text on top of the white rectangle.
For images:
It embeds the image (PNG/JPG) into the PDF.
It draws the image at the calculated coordinates.
Finally, it saves the modified buffer and triggers a download.
2. Code Editor (/code-editor)
Goal: Treat PDF layout as code. Edit the document structure using an XML-like markup language.

Parsing (
utils/pdfParser.js
):

The app reads the PDF array buffer.
It extracts all text items, including their x, y, width, height, and fontSize.
It attempts to merge scattered text items into coherent lines/blocks based on proximity.
Markup Conversion (
utils/markupConverter.js
):

The extracted JSON layout is converted into a string format:
xml
<Document>
  <Page number="1" width="600" height="800">
    <Text x="50" y="100" size="12">Hello World</Text>
  </Page>
</Document>
This string is displayed in a code editor (textarea).
Generation & Preview (
utils/pdfGenerator.js
):

As you type in the code editor, the XML is parsed back into JSON.
pdf-lib creates a brand new, blank PDF.
It iterates through the JSON and draws the text onto the new pages using a standard font (Ubuntu).
Note: This process effectively "recompiles" the PDF. It currently does not preserve the original background, images, or complex formatting of the source PDF. It generates a clean, text-only version based on your code.
3. PDF Conversion (/convert)
Current Status: This feature is currently a UI placeholder.
It allows file selection but does not yet contain the logic to convert PDF to Word/Docx.
📂 Project Structure
frontend/src/
├── components/       # Reusable UI components (Navbar, etc.)
├── pages/
│   ├── Home.jsx      # Landing page, file upload, regular vs code editor choice
│   ├── Editor.jsx    # The Visual Editor logic
│   ├── CodeEditor.jsx# The Code Editor logic
│   ├── Convert.jsx   # Conversion UI (placeholder)
│   └── ...
└── utils/
    ├── pdfParser.js      # Extracts text/layout from PDF (Code Editor)
    ├── markupConverter.js# JSON <-> XML converter (Code Editor)
    └── pdfGenerator.js   # Generates NEW PDF from layout (Code Editor)