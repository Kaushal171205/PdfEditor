import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { extractLayout } from '../utils/pdfParser';
import { jsonToMarkup, markupToJson } from '../utils/markupConverter';
import { generatePDF } from '../utils/pdfGenerator';
import './CodeEditor.css';

const CodeEditor = () => {
    const location = useLocation();
    const [markup, setMarkup] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Process incoming file from Home page
    useEffect(() => {
        const incomingFile = location.state?.pdfFile;
        if (incomingFile && incomingFile.type === 'application/pdf') {
            processFile(incomingFile);
        }
    }, [location.state]);

    // Clean up object URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const processFile = async (file) => {
        setIsProcessing(true);
        setError(null);
        try {
            const layoutData = await extractLayout(file);
            const generatedMarkup = jsonToMarkup(layoutData);
            setMarkup(generatedMarkup);

            const blob = await generatePDF(layoutData);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (err) {
            console.error(err);
            setError('Failed to process PDF. See console for details.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        processFile(file);
    };

    const handleMarkupChange = (e) => {
        setMarkup(e.target.value);
    };

    // Debounced PDF regeneration
    useEffect(() => {
        if (!markup) return;

        const timer = setTimeout(async () => {
            try {
                const layoutData = markupToJson(markup);
                const blob = await generatePDF(layoutData);

                // Revoke old URL to avoid memory leaks
                setPreviewUrl(prev => {
                    if (prev) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(blob);
                });
            } catch (err) {
                console.error("Error regenerating preview:", err);
                // Don't block UI, just log
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [markup]);

    return (
        <div className="code-editor-container">
            <div className="editor-header">
                <h2>PDF &lt;&gt; Code Editor</h2>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="file-input"
                    disabled={isProcessing}
                />
            </div>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {isProcessing && <div>Processing PDF...</div>}

            <div className="split-view">
                <div className="editor-pane">
                    <div className="pane-header">Editable Markup</div>
                    <textarea
                        className="markup-editor"
                        value={markup}
                        onChange={handleMarkupChange}
                        placeholder="Upload a PDF to see its markup representation here..."
                        spellCheck="false"
                    />
                </div>

                <div className="preview-pane">
                    <div className="pane-header">Live Preview</div>
                    {previewUrl ? (
                        <iframe
                            src={previewUrl}
                            className="pdf-preview-frame"
                            title="PDF Preview"
                        />
                    ) : (
                        <div style={{ padding: '20px', color: '#666' }}>
                            Upload a PDF to see the preview.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
