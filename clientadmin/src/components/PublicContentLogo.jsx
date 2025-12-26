const PublicContentLogo = ({ customization }) => {
  // Don't render if no customization data or no content/logo settings
  if (!customization || !customization.contentLogoSettings) {
    return null;
  }

  const {
    contentText,
    textColor,
    textSize,
    textStyle,
    fontFamily,
    logoUrl,
    logoSize,
    logoBorderRadius,
    logoSpacing
  } = customization.contentLogoSettings;

  // Check if there's any content to display
  const hasContent = contentText || logoUrl;
  
  // If no content, don't render
  if (!hasContent) {
    return null;
  }

  // Get font weight based on text style
  const getFontWeight = (style) => {
    switch (style) {
      case "bold": return "700";
      case "medium": return "500";
      case "semibold": return "600";
      case "normal":
      default: return "400";
    }
  };

  // Get font style based on text style
  const getFontStyle = (style) => {
    return style === "italic" ? "italic" : "normal";
  };

  return (
    <div 
      className="w-full p-6 text-center"
      style={{
        fontFamily: fontFamily,
        color: textColor,
        fontSize: `${textSize}px`,
        fontWeight: getFontWeight(textStyle),
        fontStyle: getFontStyle(textStyle)
      }}
    >
      <div className="max-w-4xl mx-auto">
        {logoUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={logoUrl}
              alt="Custom Logo"
              className="object-contain"
              style={{
                width: `${logoSize}px`,
                height: `${logoSize}px`,
                borderRadius: `${logoBorderRadius}px`
              }}
            />
          </div>
        )}
        
        {contentText && (
          <div 
            className="whitespace-pre-wrap"
            style={{
              marginTop: logoUrl ? `${logoSpacing}px` : '0'
            }}
          >
            {contentText}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicContentLogo;