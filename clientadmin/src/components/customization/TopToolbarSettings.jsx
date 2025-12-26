import { useState, useEffect, useRef } from "react";
import * as monaco from 'monaco-editor';

const TopToolbarSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [localCustomization, setLocalCustomization] = useState(customization);
  const [originalToolbarCode, setOriginalToolbarCode] = useState("");
  const originalEditorRef = useRef(null);
  const modifiedEditorRef = useRef(null);
  const originalEditorInstance = useRef(null);
  const modifiedEditorInstance = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalCustomization(customization);
    generateOriginalToolbarCode();
  }, [customization]);

  useEffect(() => {
    // Initialize Monaco editors
    if (originalEditorRef.current && !originalEditorInstance.current) {
      originalEditorInstance.current = monaco.editor.create(originalEditorRef.current, {
        value: originalToolbarCode,
        language: 'html',
        theme: 'vs-light',
        readOnly: true, // Make original content readonly
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        wordWrap: 'on',
        wrappingIndent: 'indent',
      });
    }

    if (modifiedEditorRef.current && !modifiedEditorInstance.current) {
      modifiedEditorInstance.current = monaco.editor.create(modifiedEditorRef.current, {
        value: localCustomization.topToolbarSettings?.modifiedHtml || "",
        language: 'html',
        theme: 'vs-light',
        readOnly: false,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        wordWrap: 'on',
        wrappingIndent: 'indent',
        smoothScrolling: true,
        mouseWheelZoom: true,
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: false,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        suggest: {
          snippetsPreventQuickSuggestions: false
        },
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto'
        }
      });

      // Listen for changes in the modified editor
      modifiedEditorInstance.current.onDidChangeModelContent(() => {
        const value = modifiedEditorInstance.current.getValue();
        setLocalCustomization(prev => ({
          ...prev,
          topToolbarSettings: {
            ...prev.topToolbarSettings,
            modifiedHtml: value
          }
        }));
      });
    }

    // Update editor values when state changes, but only if different
    if (originalEditorInstance.current) {
      const currentOriginalValue = originalEditorInstance.current.getValue();
      if (currentOriginalValue !== originalToolbarCode) {
        originalEditorInstance.current.setValue(originalToolbarCode);
      }
    }

    if (modifiedEditorInstance.current) {
      const currentModifiedValue = modifiedEditorInstance.current.getValue();
      const newModifiedValue = localCustomization.topToolbarSettings?.modifiedHtml || "";
      // Only update if the values are different to avoid interfering with user typing
      if (currentModifiedValue !== newModifiedValue) {
        modifiedEditorInstance.current.setValue(newModifiedValue);
      }
    }

    // Cleanup function
    return () => {
      if (originalEditorInstance.current) {
        originalEditorInstance.current.dispose();
        originalEditorInstance.current = null;
      }
      if (modifiedEditorInstance.current) {
        modifiedEditorInstance.current.dispose();
        modifiedEditorInstance.current = null;
      }
    };
  }, [originalToolbarCode]); // Removed localCustomization from dependencies to prevent interference

  // Calculate page count from customization data
  const getPageCount = () => {
    // Try to get page count from the pages array in customization
    if (customization && customization.pages && Array.isArray(customization.pages)) {
      return customization.pages.length || 1;
    }
    
    // Default to 1 page if no pages data is available
    return 1;
  };

  // Generate the original toolbar HTML/CSS code
  const generateOriginalToolbarCode = () => {
    // Generate dynamic page options based on actual page count
    const pageCount = getPageCount();
    let pageOptions = '';
    for (let i = 1; i <= pageCount; i++) {
      pageOptions += `        <option value="${i}">Page ${i}</option>\n`;
    }
    
    const code = `<!-- Default Top Toolbar HTML -->
<!-- IMPORTANT: Maintain these IDs for proper frontend functionality -->
<div class="toolbar-container" id="toolbar-container">
  <div class="toolbar-content">
    <!-- Page Selector - REQUIRED ID: page-selector -->
    <div class="toolbar-section page-selector-section">
      <label for="page-selector" class="toolbar-label">Page:</label>
      <select id="page-selector" class="toolbar-select">
${pageOptions}
      </select>
    </div>
    
    <!-- Toolbar Buttons - REQUIRED IDs: clip-btn, pdf-btn, calendar-btn -->
    <div class="toolbar-section buttons-section">
      <button class="toolbar-button clip-btn" id="clip-btn">
        <i class="icon-scissors"></i>
        <span>Clip</span>
      </button>
      <button class="toolbar-button pdf-btn" id="pdf-btn">
        <i class="icon-file-pdf"></i>
        <span>PDF</span>
      </button>
      <button class="toolbar-button calendar-btn" id="calendar-btn">
        <i class="icon-calendar"></i>
        <span>Calendar</span>
      </button>
    </div>
  </div>
</div>

<style>
/* Default Top Toolbar CSS */
.toolbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-selector-section {
  flex: 1;
}

.buttons-section {
  display: flex;
  gap: 10px;
}

.toolbar-label {
  font-weight: bold;
  color: #333;
  margin-right: 5px;
}

.toolbar-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
}

.toolbar-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toolbar-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-button:active {
  transform: translateY(0);
}

/* REQUIRED ICON CLASSES - DO NOT REMOVE */
.icon-scissors::before { content: "✂️"; }
.icon-file-pdf::before { content: "📄"; }
.icon-calendar::before { content: "📅"; }

/* Responsive design */
@media (max-width: 768px) {
  .toolbar-content {
    flex-direction: column;
    gap: 10px;
  }
  
  .toolbar-section {
    width: 100%;
    justify-content: center;
  }
  
  .page-selector-section {
    order: 2;
  }
  
  .buttons-section {
    order: 1;
  }
}
</style>`;
    setOriginalToolbarCode(code);
  };

  const handleChange = (field, value) => {
    // Show confirmation dialog when disabling the toolbar
    if (field === "showToolbar" && value === false) {
      const confirmed = window.confirm("Do you want to disable the frontend toolbar? This will hide the toolbar above the PDF viewer.");
      if (!confirmed) {
        return; // Don't update the state if user cancels
      }
    }
    
    setLocalCustomization(prev => ({
      ...prev,
      topToolbarSettings: {
        ...prev.topToolbarSettings,
        [field]: value
      }
    }));
  };

  const handleCopyToModified = () => {
    if (originalEditorInstance.current && modifiedEditorInstance.current) {
      const originalValue = originalEditorInstance.current.getValue();
      modifiedEditorInstance.current.setValue(originalValue);
      setLocalCustomization(prev => ({
        ...prev,
        topToolbarSettings: {
          ...prev.topToolbarSettings,
          modifiedHtml: originalValue
        }
      }));
    }
  };

  const handleResetToDefault = () => {
    if (modifiedEditorInstance.current) {
      modifiedEditorInstance.current.setValue("");
      setLocalCustomization(prev => ({
        ...prev,
        topToolbarSettings: {
          ...prev.topToolbarSettings,
          modifiedHtml: "",
          modifiedCss: ""
        }
      }));
    }
  };

  const handleSave = () => {
    // Validate that the modified HTML contains required IDs before saving
    const modifiedHtml = localCustomization.topToolbarSettings?.modifiedHtml || "";
    if (modifiedHtml.trim() !== "") {
      const requiredIds = ['page-selector', 'clip-btn', 'pdf-btn', 'calendar-btn'];
      const missingIds = requiredIds.filter(id => !modifiedHtml.includes(`id="${id}"`) && !modifiedHtml.includes(`id='${id}'`));
      
      if (missingIds.length > 0) {
        const confirmSave = window.confirm(
          `Warning: Your custom toolbar HTML is missing required IDs: ${missingIds.join(', ')}.\n\n` +
          `These IDs are essential for toolbar functionality:\n` +
          `- page-selector: Page dropdown functionality\n` +
          `- clip-btn: Clipping functionality\n` +
          `- pdf-btn: PDF viewer functionality\n` +
          `- calendar-btn: Calendar functionality\n\n` +
          `Saving without these IDs will break toolbar functionality. Do you want to continue anyway?`
        );
        
        if (!confirmSave) {
          return; // Cancel save if user doesn't confirm
        }
      }
    }    
    const updatedSettings = {
      ...localCustomization.topToolbarSettings,
      lastUpdated: new Date()
    };
    
    setCustomization(prev => ({
      ...prev,
      topToolbarSettings: updatedSettings
    }));
    
    onSave({
      ...localCustomization,
      topToolbarSettings: updatedSettings
    });
  };

  // Add undo functionality
  const handleUndo = () => {
    if (modifiedEditorInstance.current) {
      modifiedEditorInstance.current.trigger('keyboard', 'undo');
    }
  };

  // Add redo functionality
  const handleRedo = () => {
    if (modifiedEditorInstance.current) {
      modifiedEditorInstance.current.trigger('keyboard', 'redo');
    }
  };

  // Add format document functionality
  const handleFormatDocument = () => {
    if (modifiedEditorInstance.current) {
      modifiedEditorInstance.current.trigger('editor', 'editor.action.formatDocument');
    }
  };

  // Handle file upload for template
  const handleUploadTemplate = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.match(/\.(html|htm|txt)$/i)) {
      alert("Please select an HTML, HTM, or TXT file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      // Validate that the content contains required IDs
      if (validateTemplateContent(content)) {
        setOriginalToolbarCode(content);
        alert("Template uploaded successfully! Remember to maintain the required IDs for functionality.");
      } else {
        alert("Uploaded template is missing required IDs. Please ensure it contains: page-selector, clip-btn, pdf-btn, and calendar-btn.");
      }
    };
    reader.readAsText(file);
  };

  // Validate that uploaded template contains required IDs
  const validateTemplateContent = (content) => {
    const requiredIds = ['page-selector', 'clip-btn', 'pdf-btn', 'calendar-btn'];
    const missingIds = requiredIds.filter(id => !content.includes(`id="${id}"`) && !content.includes(`id='${id}'`));
    
    if (missingIds.length > 0) {
      alert(`Uploaded template is missing required IDs: ${missingIds.join(', ')}. 

These IDs are essential for toolbar functionality:
- page-selector: Page dropdown functionality
- clip-btn: Clipping functionality
- pdf-btn: PDF viewer functionality
- calendar-btn: Calendar functionality

Please ensure your template includes all these IDs.`);
      return false;
    }
    
    return true;
  };
  
  // Validate that the modified HTML contains required IDs
  const validateModifiedHtml = (content) => {
    const requiredIds = ['page-selector', 'clip-btn', 'pdf-btn', 'calendar-btn'];
    const missingIds = requiredIds.filter(id => !content.includes(`id="${id}"`) && !content.includes(`id='${id}'`));
    
    if (missingIds.length > 0) {
      console.warn('Custom toolbar HTML is missing required IDs:', missingIds);
      return false;
    }
    
    return true;
  };

  // Handle upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Yellow Information Box */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> Any incorrect modifications may break functionality. Upgrades will not auto-apply if modified.
            </p>
          </div>
        </div>
      </div>

      {/* Critical IDs Information Box */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>Critical IDs for Functionality:</strong> To ensure proper frontend functionality, you <strong>MUST</strong> maintain these required IDs in your custom HTML:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 mt-2">
              <li><code>page-selector</code> - For the page dropdown functionality</li>
              <li><code>clip-btn</code> - For the clipping functionality</li>
              <li><code>pdf-btn</code> - For the PDF viewer functionality</li>
              <li><code>calendar-btn</code> - For the calendar functionality</li>
              <li><code>toolbar-container</code> - For the main toolbar container</li>
            </ul>
            <p className="text-sm text-red-700 mt-2">
              Removing or changing these IDs will break the corresponding frontend functionality.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Visibility Toggle */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-700">Show Top Toolbar</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localCustomization.topToolbarSettings?.showToolbar ?? true}
                onChange={(e) => handleChange("showToolbar", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Editor Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-200">
          <div className="px-6 py-3 bg-gray-50 border-r border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Original Content (Read-only Reference)</h3>
          </div>
          <div className="px-6 py-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Modified Content</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={handleUndo}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Undo (Ctrl+Z)"
                >
                  Undo
                </button>
                <button 
                  onClick={handleRedo}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Redo (Ctrl+Y)"
                >
                  Redo
                </button>
                <button 
                  onClick={handleFormatDocument}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Format Document (Shift+Alt+F)"
                >
                  Format
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Editor Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: '450px' }}>
          {/* Original Content Panel - Read-only with Upload UI */}
          <div className="border-r border-gray-200 flex flex-col">
            <div 
              ref={originalEditorRef} 
              className="flex-grow"
              style={{ height: '400px' }}
            />
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center mb-3">
                <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-600">
                  This is a read-only reference. Upload custom UI or click "Copy to Modified" to use as a starting point.
                </p>
              </div>
              
              {/* Upload UI for Original Content */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Upload Custom UI Template
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".html,.htm,.txt"
                    onChange={handleUploadTemplate}
                    className="flex-1 text-xs"
                    id="template-upload"
                    ref={fileInputRef}
                  />
                  <button
                    onClick={handleUploadClick}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Upload
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload an HTML template with required IDs to replace the default UI
                </p>
              </div>
              
              <button
                onClick={handleCopyToModified}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Copy to Modified
              </button>
            </div>
          </div>

          {/* Modified Content Panel - Editable */}
          <div className="flex flex-col">
            <div 
              ref={modifiedEditorRef} 
              className="flex-grow"
              style={{ height: '400px' }}
            />
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Live Preview of Modified Toolbar</h4>
              <div className="border border-gray-300 rounded p-4 min-h-[100px] bg-white">
                {localCustomization.topToolbarSettings?.modifiedHtml ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: localCustomization.topToolbarSettings.modifiedHtml 
                    }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">No modified content. The original toolbar will be shown.</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Edit the HTML/CSS in the editor above. Changes will appear here in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleResetToDefault}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset to Default
          </button>
          <button
            onClick={() => window.history.back()}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      
      {/* Editor Shortcuts Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Editor Shortcuts</h4>
        <ul className="text-xs text-blue-700 grid grid-cols-1 md:grid-cols-2 gap-1">
          <li>• <kbd className="bg-blue-100 px-1 rounded">Ctrl + Z</kbd> - Undo</li>
          <li>• <kbd className="bg-blue-100 px-1 rounded">Ctrl + Y</kbd> - Redo</li>
          <li>• <kbd className="bg-blue-100 px-1 rounded">Ctrl + S</kbd> - Save</li>
          <li>• <kbd className="bg-blue-100 px-1 rounded">Shift + Alt + F</kbd> - Format Document</li>
          <li>• <kbd className="bg-blue-100 px-1 rounded">Ctrl + Space</kbd> - Trigger Suggestion</li>
          <li>• <kbd className="bg-blue-100 px-1 rounded">Ctrl + F</kbd> - Find</li>
        </ul>
      </div>
    </div>
  );
};

export default TopToolbarSettings;