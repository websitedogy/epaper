import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import { Extension, Node } from '@tiptap/core';
import { useEffect, useState } from 'react';

// Custom Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['\"]\+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Custom Social Icon Node
const SocialIcon = Node.create({
  name: 'socialIcon',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      platform: {
        default: null,
      },
      url: {
        default: null,
      },
      symbol: {
        default: null,
      },
      iconClass: {
        default: null,
      },
      color: {
        default: '#000000',
      },
      textColor: {
        default: '#FFFFFF',
      },
      displayName: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-social-icon]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'a',
      {
        href: node.attrs.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        'data-social-icon': node.attrs.platform,
        class: 'social-icon-badge',
        style: `display: inline-flex; align-items: center; gap: 6px; background-color: ${node.attrs.color}; color: ${node.attrs.textColor}; padding: 6px 12px; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 4px; white-space: nowrap;`,
      },
      [
        'i',
        { class: node.attrs.iconClass },
        '',
      ],
      [
        'span',
        { class: 'icon-name' },
        node.attrs.displayName,
      ],
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('a');
      dom.href = node.attrs.url;
      dom.target = '_blank';
      dom.rel = 'noopener noreferrer';
      dom.className = 'social-icon-badge';
      dom.setAttribute('data-social-icon', node.attrs.platform);
      dom.style.cssText = `display: inline-flex; align-items: center; gap: 6px; background-color: ${node.attrs.color}; color: ${node.attrs.textColor}; padding: 6px 12px; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 4px; white-space: nowrap; cursor: pointer;`;
      
      const iconElement = document.createElement('i');
      iconElement.className = node.attrs.iconClass;
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'icon-name';
      nameSpan.textContent = node.attrs.displayName;
      
      dom.appendChild(iconElement);
      dom.appendChild(nameSpan);
      
      return {
        dom,
        contentDOM: null,
      };
    };
  },
});

const RichTextEditor = ({ content, onChange }) => {
  const [error, setError] = useState(null);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showSocialIcons, setShowSocialIcons] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentBgColor, setCurrentBgColor] = useState('#ffff00');
  const [currentFontSize, setCurrentFontSize] = useState('16px');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      SocialIcon,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'inline-image',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      try {
        if (onChange) {
          onChange(editor.getHTML());
        }
      } catch (err) {
        console.error('Error updating editor content:', err);
        setError(err.message);
      }
    },
  });

  useEffect(() => {
    try {
      if (editor && content !== undefined && content !== editor.getHTML()) {
        editor.commands.setContent(content || '');
      }
    } catch (err) {
      console.error('Error setting editor content:', err);
      setError(err.message);
    }
  }, [content, editor]);

  if (error) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <p className="text-red-600">Editor error: {error}</p>
        <p className="text-sm text-red-500 mt-2">Please refresh the page or contact support.</p>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    );
  }

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          editor.chain().focus().setImage({ src: event.target.result }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addImageByUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const resizeImage = (size) => {
    // Update image attributes with width
    editor.chain().focus().updateAttributes('image', {
      width: size,
      style: `width: ${size}; height: auto;`,
    }).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const setColor = () => {
    const color = window.prompt('Enter color (hex or name):');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const applyTextColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setCurrentTextColor(color);
    setShowTextColorPicker(false);
  };

  const applyBgColor = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run();
    setCurrentBgColor(color);
    setShowBgColorPicker(false);
  };

  const applyFontFamily = (font) => {
    editor.chain().focus().setFontFamily(font).run();
    setShowFontFamily(false);
  };

  const applyFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run();
    setCurrentFontSize(size);
    setShowFontSize(false);
  };

  const insertIcon = () => {
    const icon = window.prompt('Enter emoji or icon (e.g., ⭐, 📧, 📱, 🌐):');
    if (icon) {
      editor.chain().focus().insertContent(icon).run();
    }
  };

  const insertSocialIcon = (social) => {
    if (!editor) {
      console.error('Editor not ready');
      return;
    }
    
    // Prompt for URL
    const url = window.prompt(`Enter ${social.displayName} URL:`, 'https://');
    
    if (!url || url === 'https://') {
      console.log('URL entry cancelled or empty');
      setShowSocialIcons(false);
      return;
    }
    
    try {
      console.log('Inserting social icon with URL:', social.displayName, url);
      
      // Insert the custom social icon node
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'socialIcon',
          attrs: {
            platform: social.name,
            url: url,
            symbol: social.symbol,
            iconClass: social.iconClass,
            color: social.color,
            textColor: social.textColor,
            displayName: social.displayName,
          },
        })
        .insertContent(' ')
        .run();
      
      console.log('Icon inserted successfully');
    } catch (error) {
      console.error('Error inserting social icon:', error);
    }
    
    setShowSocialIcons(false);
  };

  const commonColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#008000', '#000080', '#ff69b4', '#ffd700', '#4b0082'
  ];

  const fontFamilies = [
    { name: 'Default', value: 'inherit' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
    { name: 'Impact', value: 'Impact, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
  ];

  const fontSizes = [
    { name: 'Small', value: '12px' },
    { name: 'Normal', value: '16px' },
    { name: 'Medium', value: '20px' },
    { name: 'Large', value: '24px' },
    { name: 'Extra Large', value: '32px' },
    { name: 'Huge', value: '48px' },
  ];

  const socialIcons = [
    {
      name: 'Facebook',
      color: '#1877F2',
      textColor: '#FFFFFF',
      symbol: 'f',
      iconClass: 'fab fa-facebook-f',
      displayName: 'Facebook'
    },
    {
      name: 'Twitter/X',
      color: '#000000',
      textColor: '#FFFFFF',
      symbol: '𝕏',
      iconClass: 'fab fa-twitter',
      displayName: 'Twitter'
    },
    {
      name: 'Instagram',
      color: '#E4405F',
      textColor: '#FFFFFF',
      symbol: '📷',
      iconClass: 'fab fa-instagram',
      displayName: 'Instagram'
    },
    {
      name: 'LinkedIn',
      color: '#0A66C2',
      textColor: '#FFFFFF',
      symbol: 'in',
      iconClass: 'fab fa-linkedin-in',
      displayName: 'LinkedIn'
    },
    {
      name: 'YouTube',
      color: '#FF0000',
      textColor: '#FFFFFF',
      symbol: '▶',
      iconClass: 'fab fa-youtube',
      displayName: 'YouTube'
    },
    {
      name: 'WhatsApp',
      color: '#25D366',
      textColor: '#FFFFFF',
      symbol: '💬',
      iconClass: 'fab fa-whatsapp',
      displayName: 'WhatsApp'
    },
    {
      name: 'Telegram',
      color: '#26A5E4',
      textColor: '#FFFFFF',
      symbol: '✈',
      iconClass: 'fab fa-telegram-plane',
      displayName: 'Telegram'
    },
    {
      name: 'Snapchat',
      color: '#FFFC00',
      textColor: '#000000',
      symbol: '👻',
      iconClass: 'fab fa-snapchat-ghost',
      displayName: 'Snapchat'
    }
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar - Responsive */}
      <div className="bg-gray-50 border-b border-gray-300 p-2">
        {/* Mobile: Scrollable horizontal toolbar */}
        <div className="md:hidden">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {/* Text Formatting */}
            <div className="flex gap-1 border-r border-gray-300 pr-2 flex-shrink-0">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
                  editor.isActive('bold') ? 'bg-gray-300 font-bold' : ''
                }`}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
                  editor.isActive('italic') ? 'bg-gray-300 italic' : ''
                }`}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                onClick={() => {
                  if (editor.chain().focus().toggleUnderline) {
                    editor.chain().focus().toggleUnderline().run();
                  }
                }}
                className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
                  editor.isActive('underline') ? 'bg-gray-300 underline' : ''
                }`}
                title="Underline"
              >
                <u>U</u>
              </button>
            </div>

            {/* Links & Images */}
            <div className="flex gap-1 border-r border-gray-300 pr-2 flex-shrink-0">
              <button
                onClick={addImage}
                className="px-3 py-1.5 rounded hover:bg-gray-200"
                title="Upload Image"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </button>
              <button
                onClick={setLink}
                className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
                  editor.isActive('link') ? 'bg-gray-300' : ''
                }`}
                title="Add Link"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                </svg>
              </button>
            </div>

            {/* Colors */}
            <div className="flex gap-1 border-r border-gray-300 pr-2 flex-shrink-0">
              <button
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                className="px-3 py-1.5 rounded hover:bg-gray-200"
                title="Text Color"
              >
                <div className="flex flex-col items-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <div className="w-4 h-1 mt-0.5" style={{ backgroundColor: currentTextColor }}></div>
                </div>
              </button>
              <button
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className="px-3 py-1.5 rounded hover:bg-gray-200"
                title="Highlight"
              >
                <div className="flex flex-col items-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
                  </svg>
                  <div className="w-4 h-1 mt-0.5" style={{ backgroundColor: currentBgColor }}></div>
                </div>
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setShowSocialIcons(!showSocialIcons)}
                className="px-3 py-1.5 rounded hover:bg-gray-200"
                title="Social Media"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tablet & Desktop: Multi-row toolbar */}
        <div className="hidden md:flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('bold') ? 'bg-gray-300 font-bold' : ''
            }`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('italic') ? 'bg-gray-300 italic' : ''
            }`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => {
              // Check if StarterKit has underline, otherwise just toggle strike
              if (editor.chain().focus().toggleUnderline) {
                editor.chain().focus().toggleUnderline().run();
              } else {
                console.warn('Underline not available in this StarterKit version');
              }
            }}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('underline') ? 'bg-gray-300 underline' : ''
            }`}
            title="Underline (may not be available)"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('strike') ? 'bg-gray-300 line-through' : ''
            }`}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 text-sm ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 font-bold' : ''
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 text-sm ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 font-bold' : ''
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 text-sm ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 font-bold' : ''
            }`}
            title="Heading 3"
          >
            H3
          </button>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 text-sm ${
              editor.isActive('paragraph') ? 'bg-gray-300' : ''
            }`}
            title="Paragraph"
          >
            P
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h10a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h10a1 1 0 110 2H3a1 1 0 110-2z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4h14a1 1 0 110 2H3a1 1 0 110-2zm2 4h10a1 1 0 110 2H5a1 1 0 110-2zm-2 4h14a1 1 0 110 2H3a1 1 0 110-2zm2 4h10a1 1 0 110 2H5a1 1 0 110-2z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4h14a1 1 0 110 2H3a1 1 0 110-2zm4 4h10a1 1 0 110 2H7a1 1 0 110-2zm-4 4h14a1 1 0 110 2H3a1 1 0 110-2zm4 4h10a1 1 0 110 2H7a1 1 0 110-2z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300' : ''
            }`}
            title="Justify"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2z" />
            </svg>
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('bulletList') ? 'bg-gray-300' : ''
            }`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('orderedList') ? 'bg-gray-300' : ''
            }`}
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>
        </div>

        {/* Links & Images */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={setLink}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('link') ? 'bg-gray-300' : ''
            }`}
            title="Add Link"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
            </svg>
          </button>
          <button
            onClick={addImage}
            className="px-3 py-1.5 rounded hover:bg-gray-200"
            title="Upload Image"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </button>
          <button
            onClick={addImageByUrl}
            className="px-3 py-1.5 rounded hover:bg-gray-200 text-xs"
            title="Image URL"
          >
            URL
          </button>
        </div>

        {/* Image Sizing Controls */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => resizeImage('25%')}
            className="px-2 py-1.5 rounded hover:bg-gray-200 text-xs"
            title="Small (25%)"
          >
            25%
          </button>
          <button
            onClick={() => resizeImage('50%')}
            className="px-2 py-1.5 rounded hover:bg-gray-200 text-xs"
            title="Medium (50%)"
          >
            50%
          </button>
          <button
            onClick={() => resizeImage('75%')}
            className="px-2 py-1.5 rounded hover:bg-gray-200 text-xs"
            title="Large (75%)"
          >
            75%
          </button>
          <button
            onClick={() => resizeImage('100%')}
            className="px-2 py-1.5 rounded hover:bg-gray-200 text-xs"
            title="Full Size (100%)"
          >
            100%
          </button>
        </div>

        {/* Font Family */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 relative">
          <button
            onClick={() => setShowFontFamily(!showFontFamily)}
            className="px-3 py-1.5 rounded hover:bg-gray-200 text-xs"
            title="Font Family"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 4l2.3 5.29h-4.6zM8.57 11h2.86L12.7 14h2.3l-4-10h-2l-4 10h2.3l1.27-3z"/>
            </svg>
          </button>
          {showFontFamily && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-48">
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  onClick={() => applyFontFamily(font.value)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 relative">
          <button
            onClick={() => setShowFontSize(!showFontSize)}
            className="px-3 py-1.5 rounded hover:bg-gray-200 text-xs flex items-center gap-1"
            title="Font Size"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h5v8H4V6zm7 0h5v8h-5V6z"/>
            </svg>
            <span className="text-xs">A</span>
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-40">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => applyFontSize(size.value)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  style={{ fontSize: size.value }}
                >
                  {size.name} ({size.value})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          {/* Text Color */}
          <div className="relative">
            <button
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              className="px-3 py-1.5 rounded hover:bg-gray-200"
              title="Text Color"
            >
              <div className="flex flex-col items-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <div className="w-4 h-1 mt-0.5" style={{ backgroundColor: currentTextColor }}></div>
              </div>
            </button>
            {showTextColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-10">
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {commonColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => applyTextColor(color)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentTextColor}
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="w-full h-8 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Background/Highlight Color */}
          <div className="relative">
            <button
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              className="px-3 py-1.5 rounded hover:bg-gray-200"
              title="Highlight Color"
            >
              <div className="flex flex-col items-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
                </svg>
                <div className="w-4 h-1 mt-0.5" style={{ backgroundColor: currentBgColor }}></div>
              </div>
            </button>
            {showBgColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-10">
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {commonColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => applyBgColor(color)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentBgColor}
                  onChange={(e) => applyBgColor(e.target.value)}
                  className="w-full h-8 cursor-pointer"
                />
                <button
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                  className="w-full mt-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Remove Highlight
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Icons/Emojis */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 relative">
          <button
            onClick={insertIcon}
            className="px-3 py-1.5 rounded hover:bg-gray-200"
            title="Insert Emoji"
          >
            ⭐
          </button>
          <button
            onClick={() => setShowSocialIcons(!showSocialIcons)}
            className="px-3 py-1.5 rounded hover:bg-gray-200"
            title="Insert Social Media Icon"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </button>
          {showSocialIcons && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-10 p-2 sm:p-3 w-72 sm:w-80">
              <div className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 px-1">Social Media Icons</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {socialIcons.map((social) => (
                  <button
                    key={social.name}
                    onClick={() => insertSocialIcon(social)}
                    className="flex flex-col items-center p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-200 hover:border-gray-300 hover:shadow-md group"
                    title={social.displayName}
                    style={{
                      backgroundColor: social.color + '15',
                    }}
                  >
                    <div 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg mb-1 sm:mb-1.5 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: social.color, color: social.textColor }}
                    >
                      <i className={`${social.iconClass} text-lg sm:text-xl`}></i>
                    </div>
                    <span className="text-xs text-gray-700 font-medium text-center">{social.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="px-3 py-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="px-3 py-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>
        </div>
      </div>

      {/* Editor Content - Responsive */}
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-2 sm:p-4 min-h-[250px] sm:min-h-[300px] focus:outline-none overflow-x-auto"
      />

      {/* Custom Styles for Editor */}
      <style>{`
        .ProseMirror {
          min-height: 300px;
          outline: none;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 2rem;
          margin: 0.5rem 0;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
        }
        /* Social Media Icon Links Styling */
        .ProseMirror a.social-icon-link {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin: 0 4px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .ProseMirror a.social-icon-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: inline-block;
          margin: 0.5rem;
          cursor: pointer;
          border-radius: 4px;
        }
        .ProseMirror img.inline-image {
          vertical-align: middle;
        }
        .ProseMirror img:hover {
          opacity: 0.9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .ProseMirror mark {
          padding: 0.1em 0.2em;
          border-radius: 2px;
        }
                
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ProseMirror {
            min-height: 250px;
            font-size: 14px;
          }
          .ProseMirror h1 {
            font-size: 1.5em;
          }
          .ProseMirror h2 {
            font-size: 1.25em;
          }
          .ProseMirror h3 {
            font-size: 1.1em;
          }
        }
                
        @media (max-width: 480px) {
          .ProseMirror {
            font-size: 13px;
          }
          .ProseMirror h1 {
            font-size: 1.3em;
          }
          .ProseMirror h2 {
            font-size: 1.15em;
          }
          .ProseMirror h3 {
            font-size: 1.05em;
          }
        }
                
        /* Scrollbar styling for mobile */
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
