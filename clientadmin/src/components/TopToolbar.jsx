import React, { useState, useEffect } from 'react';

const TopToolbar = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onClipClick, 
  onPdfClick, 
  onCalendarClick,
  customization,
  windowWidth
}) => {
  const [showPageSelector, setShowPageSelector] = useState(false);

  // Close page selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPageSelector && !event.target.closest('.page-selector-container')) {
        setShowPageSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPageSelector]);

  const handlePageChange = (page) => {
    onPageChange(page);
    setShowPageSelector(false);
  };

  // If we have custom toolbar HTML, render it
  if (customization?.topToolbarSettings?.modifiedHtml) {
    return (
      <div 
        className="top-toolbar-modified"
        dangerouslySetInnerHTML={{ 
          __html: `
            ${customization.topToolbarSettings.modifiedHtml}
            <style>${customization.topToolbarSettings.modifiedCss || ''}</style>
          ` 
        }}
      />
    );
  }

  // Otherwise, render the default toolbar
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '50px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '95%',
      maxWidth: '800px',
      flexDirection: 'row',
      gap: '0',
      overflowX: windowWidth <= 576 ? 'auto' : 'visible',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      margin: '10px auto',
      flexWrap: windowWidth <= 576 ? 'nowrap' : 'wrap'
    }} className="crisp-text">
      {/* Hide scrollbar for Webkit browsers */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Page Selector Dropdown - Hidden in mobile view per requirements */}
      {windowWidth > 576 && (
        <div style={{ 
          position: 'relative',
          minWidth: windowWidth <= 576 ? 'auto' : '120px',
          flexShrink: windowWidth <= 576 ? 0 : 'initial'
        }} className="page-selector-container">
          <button
            onClick={() => setShowPageSelector(!showPageSelector)}
            style={{
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '20px',
              padding: windowWidth <= 576 ? '8px 12px' : '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: windowWidth <= 576 ? 'auto' : '120px',
              height: windowWidth <= 576 ? '36px' : 'auto'
            }}
          >
            <span>Page {currentPage}</span>
            <svg 
              style={{ 
                width: '16px', 
                height: '16px', 
                marginLeft: '8px',
                transform: showPageSelector ? 'rotate(180deg)' : 'rotate(0)'
              }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showPageSelector && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              marginTop: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              minWidth: windowWidth <= 576 ? '100px' : '120px',
              zIndex: 1001
            }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <div
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: windowWidth <= 576 ? '10px 14px' : '10px 16px',
                    cursor: 'pointer',
                    backgroundColor: page === currentPage ? '#e5e7eb' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: page === currentPage ? '600' : 'normal',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  Page {page}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        minWidth: windowWidth <= 576 ? 'auto' : 'auto',
        margin: '0 10px',
        flexShrink: 0
      }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.5 : 1,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: windowWidth <= 576 ? '32px' : '32px',
            height: windowWidth <= 576 ? '32px' : '32px',
            minWidth: windowWidth <= 576 ? '32px' : '32px'
          }}
        >
          <svg style={{ 
            width: '20px', 
            height: '20px' 
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div style={{
          margin: '0 12px',
          fontSize: '14px',
          fontWeight: '500',
          minWidth: windowWidth <= 576 ? '50px' : '60px',
          textAlign: 'center'
        }}>
          {currentPage} / {totalPages}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.5 : 1,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: windowWidth <= 576 ? '32px' : '32px',
            height: windowWidth <= 576 ? '32px' : '32px',
            minWidth: windowWidth <= 576 ? '32px' : '32px'
          }}
        >
          <svg style={{ 
            width: '20px', 
            height: '20px' 
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        justifyContent: 'flex-end',
        flexShrink: 0
      }}>
        <button 
          onClick={onClipClick}
          id="clip-btn"
          style={{
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '20px',
            padding: windowWidth <= 576 ? '8px 12px' : '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: windowWidth <= 576 ? '36px' : 'auto'
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0l-2 18a1 1 0 001 1h8a1 1 0 001-1l-2-18" />
          </svg>
          {windowWidth > 576 && <span>Clip</span>}
        </button>
        
        <button 
          onClick={onPdfClick}
          id="pdf-btn"
          style={{
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '20px',
            padding: windowWidth <= 576 ? '8px 12px' : '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: windowWidth <= 576 ? '36px' : 'auto'
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {windowWidth > 576 && <span>PDF</span>}
        </button>
        
        <button 
          onClick={onCalendarClick}
          id="calendar-btn"
          style={{
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '20px',
            padding: windowWidth <= 576 ? '8px 12px' : '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: windowWidth <= 576 ? '36px' : 'auto'
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {windowWidth > 576 && <span>Calendar</span>}
        </button>
      </div>
    </div>
  );
};

export default TopToolbar;