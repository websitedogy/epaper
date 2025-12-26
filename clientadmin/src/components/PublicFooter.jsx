import { Link } from "react-router-dom";

const PublicFooter = ({ customization }) => {
  // Don't render footer if no customization data
  if (!customization) return null;

  // Check if custom footer code exists
  if (customization?.footer?.customFooterCode) {
    // Render custom footer code
    return (
      <div dangerouslySetInnerHTML={{ __html: customization.footer.customFooterCode }} />
    );
  }

  // Check if any footer content exists
  const hasFooterContent = 
    customization?.footer?.logoUrl ||
    customization?.footer?.copyright ||
    customization?.footer?.address ||
    (customization?.footer?.contactNumbers?.length > 0) ||
    customization?.footer?.email ||
    customization?.footer?.officeHours ||
    Object.values(customization?.footer?.socialMedia || {}).some(url => url) ||
    customization?.footer?.ownerPhotoUrl ||
    customization?.footer?.ownerName ||
    customization?.footer?.ownerTitle ||
    customization?.footer?.ownerDescription ||
    customization?.footer?.privacyPolicyUrl ||
    customization?.footer?.termsOfServiceUrl ||
    customization?.footer?.developerName ||
    customization?.footer?.developerWebsite ||
    customization?.footer?.supportEmail ||
    customization?.footer?.documentationUrl ||
    customization?.footer?.contentText;

  // If no footer content, don't render
  if (!hasFooterContent) return null;

  return (
    <>
      <footer 
        className="bg-gray-800 text-white"
        style={{
          backgroundColor: customization?.footer?.backgroundColor || "#1a202c",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* New Content & Logo Section */}
        {(customization?.footer?.contentText || customization?.footer?.logoUrl) && (
          <div className="mb-8 pb-8 border-b border-gray-700">
            <div className="flex flex-col items-center text-center">
              {customization?.footer?.logoUrl && (
                <img
                  src={customization.footer.logoUrl}
                  alt="Footer Logo"
                  className="object-contain mb-4"
                  style={{
                    width: `${customization.footer.logoSize || 100}px`,
                    height: `${customization.footer.logoSize || 100}px`,
                    borderRadius: `${customization.footer.logoBorderRadius || 0}px`,
                  }}
                />
              )}
              
              {customization?.footer?.contentText && (
                <div 
                  className="footer-rich-content"
                  dangerouslySetInnerHTML={{ __html: customization.footer.contentText }}
                />
              )}
            </div>
          </div>
        )}
        
        {/* Owner Information - Centered for both desktop and mobile */}
        {(customization?.footer?.ownerPhotoUrl || customization?.footer?.ownerName || customization?.footer?.ownerTitle || customization?.footer?.ownerDescription || customization?.footer?.ownerMobileNo) && (
          <div className="mb-8 pb-8 border-b border-gray-700">
            <div className="flex flex-col items-center text-center">
              {customization?.footer?.ownerPhotoUrl && (
                <img
                  src={customization.footer.ownerPhotoUrl}
                  alt="Owner"
                  className="object-cover mb-4"
                  style={{
                    width: `${customization.footer.ownerPhotoSize || 100}px`,
                    height: `${customization.footer.ownerPhotoSize || 100}px`,
                    borderRadius: `${customization.footer.ownerPhotoBorderRadius || 50}%`,
                  }}
                />
              )}
              <div className="space-y-2">
                {customization?.footer?.ownerName && (
                  <h3 
                    className="font-semibold"
                    style={{
                      color: customization.footer.ownerTextColor || "#000000",
                      fontSize: `${customization.footer.ownerTextSize || 14}px`,
                      fontWeight: customization.footer.ownerFontWeight || "normal",
                      fontFamily: customization.footer.ownerFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.ownerName}
                  </h3>
                )}
                {customization?.footer?.ownerTitle && (
                  <p 
                    className="text-sm"
                    style={{
                      color: customization.footer.ownerTextColor || "#000000",
                      fontSize: `${customization.footer.ownerTextSize - 2 || 12}px`,
                      fontWeight: customization.footer.ownerFontWeight || "normal",
                      fontFamily: customization.footer.ownerFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.ownerTitle}
                  </p>
                )}
                {customization?.footer?.ownerMobileNo && (
                  <p 
                    className="text-sm"
                    style={{
                      color: customization.footer.ownerTextColor || "#000000",
                      fontSize: `${customization.footer.ownerTextSize - 2 || 12}px`,
                      fontWeight: customization.footer.ownerFontWeight || "normal",
                      fontFamily: customization.footer.ownerFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.ownerMobileNo}
                  </p>
                )}
                {customization?.footer?.ownerDescription && (
                  <p 
                    className="text-sm"
                    style={{
                      color: customization.footer.ownerTextColor || "#000000",
                      fontSize: `${customization.footer.ownerTextSize - 2 || 12}px`,
                      fontWeight: customization.footer.ownerFontWeight || "normal",
                      fontFamily: customization.footer.ownerFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.ownerDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Copyright */}
          <div className="space-y-4">
            {/* Removed duplicate logo display since it's already shown in the Content & Logo section above */}
            
            {customization?.footer?.copyright && (
              <p className="text-gray-400 text-sm">
                {customization.footer.copyright}
              </p>
            )}
            
            {customization?.footer?.trademark && (
              <p className="text-gray-400 text-xs">
                {customization.footer.trademark}
              </p>
            )}
          </div>

          {/* Contact Information */}
          {(customization?.footer?.contactName || customization?.footer?.contactMobileNo || customization?.footer?.contactGmail || customization?.footer?.contactWebsiteLink || customization?.footer?.address || customization?.footer?.contactNumbers?.length > 0 || customization?.footer?.email || customization?.footer?.officeHours) && (
            <div className="space-y-4">
              <h3 
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{
                  color: customization.footer.contactTextColor || "#000000",
                  fontSize: `${customization.footer.contactTextSize || 14}px`,
                  fontWeight: customization.footer.contactTextWeight || "normal",
                  fontFamily: customization.footer.contactFontFamily || "Poppins",
                }}
              >
                Contact Us
              </h3>
              
              {customization?.footer?.contactName && (
                <div>
                  <p 
                    style={{
                      color: customization.footer.contactTextColor || "#000000",
                      fontSize: `${customization.footer.contactTextSize || 14}px`,
                      fontWeight: customization.footer.contactTextWeight || "normal",
                      fontFamily: customization.footer.contactFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.contactName}
                  </p>
                </div>
              )}
              
              {customization?.footer?.contactMobileNo && (
                <div>
                  <p 
                    style={{
                      color: customization.footer.contactTextColor || "#000000",
                      fontSize: `${customization.footer.contactTextSize || 14}px`,
                      fontWeight: customization.footer.contactTextWeight || "normal",
                      fontFamily: customization.footer.contactFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.contactMobileNo}
                  </p>
                </div>
              )}
              
              {customization?.footer?.contactGmail && (
                <div>
                  <a 
                    href={`mailto:${customization.footer.contactGmail}`}
                    style={{
                      color: customization.footer.contactTextColor || "#000000",
                      fontSize: `${customization.footer.contactTextSize || 14}px`,
                      fontWeight: customization.footer.contactTextWeight || "normal",
                      fontFamily: customization.footer.contactFontFamily || "Poppins",
                    }}
                    className="hover:underline"
                  >
                    {customization.footer.contactGmail}
                  </a>
                </div>
              )}
              
              {customization?.footer?.contactWebsiteLink && (
                <div>
                  <a 
                    href={customization.footer.contactWebsiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: customization.footer.contactTextColor || "#000000",
                      fontSize: `${customization.footer.contactTextSize || 14}px`,
                      fontWeight: customization.footer.contactTextWeight || "normal",
                      fontFamily: customization.footer.contactFontFamily || "Poppins",
                    }}
                    className="hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              
              {/* Existing contact fields */}
              {customization?.footer?.address && (
                <div>
                  <p 
                    className="text-gray-400 text-sm"
                    style={{
                      color: customization.footer.contactTextColor || "#000000",
                      fontSize: `${customization.footer.contactTextSize - 2 || 12}px`,
                      fontWeight: customization.footer.contactTextWeight || "normal",
                      fontFamily: customization.footer.contactFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.address}
                  </p>
                </div>
              )}

              {customization?.footer?.contactNumbers?.length > 0 && (
                <div>
                  {customization.footer.contactNumbers.map((number, index) => (
                    <p 
                      key={index} 
                      className="text-gray-400 text-sm"
                      style={{
                        color: customization.footer.contactTextColor || "#000000",
                        fontSize: `${customization.footer.contactTextSize - 2 || 12}px`,
                        fontWeight: customization.footer.contactTextWeight || "normal",
                        fontFamily: customization.footer.contactFontFamily || "Poppins",
                      }}
                    >
                      {number}
                    </p>
                  ))}
                </div>
              )}

              {customization?.footer?.email && (
                <div>
                  <a 
                    href={`mailto:${customization.footer.email}`} 
                    className="text-indigo-300 hover:text-white text-sm"
                    style={{
                      color: customization.footer.contactTextColor || "#000000",
                      fontSize: `${customization.footer.contactTextSize - 2 || 12}px`,
                      fontWeight: customization.footer.contactTextWeight || "normal",
                      fontFamily: customization.footer.contactFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.email}
                  </a>
                </div>
              )}

              {customization?.footer?.officeHours && (
                <div>
                  <p 
                    className="text-gray-400 text-sm"
                    style={{
                      color: customization.footer.contactTextColor || "#000000",
                      fontSize: `${customization.footer.contactTextSize - 2 || 12}px`,
                      fontWeight: customization.footer.contactTextWeight || "normal",
                      fontFamily: customization.footer.contactFontFamily || "Poppins",
                    }}
                  >
                    {customization.footer.officeHours}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Social Media and Legal */}
          <div className="space-y-6">
            {/* Social Media */}
            {customization?.footer?.socialMedia && Object.values(customization.footer.socialMedia).some(url => url) && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {customization.footer.socialMedia.facebook && (
                    <a
                      href={customization.footer.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="sr-only">Facebook</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                  
                  {customization.footer.socialMedia.twitter && (
                    <a
                      href={customization.footer.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="sr-only">Twitter</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  )}
                  
                  {customization.footer.socialMedia.instagram && (
                    <a
                      href={customization.footer.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="sr-only">Instagram</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                  
                  {customization.footer.socialMedia.linkedin && (
                    <a
                      href={customization.footer.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="sr-only">LinkedIn</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                  
                  {customization.footer.socialMedia.youtube && (
                    <a
                      href={customization.footer.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="sr-only">YouTube</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM10 15l5-3-5-3v6Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Legal Links */}
            <div className="space-y-2">
              {customization?.footer?.privacyPolicyUrl && (
                <a 
                  href={customization.footer.privacyPolicyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white text-sm"
                >
                  Privacy Policy
                </a>
              )}
              
              {customization?.footer?.termsOfServiceUrl && (
                <a 
                  href={customization.footer.termsOfServiceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white text-sm"
                >
                  Terms of Service
                </a>
              )}
            </div>

            {/* Developer Information */}
            {(customization?.footer?.developerName || customization?.footer?.developerWebsite || customization?.footer?.supportEmail || customization?.footer?.documentationUrl) && (
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Developed by
                </h3>
                <div className="space-y-2">
                  {customization?.footer?.developerName && (
                    <p className="text-gray-400 text-sm">
                      {customization.footer.developerName}
                    </p>
                  )}
                  
                  {customization?.footer?.developerWebsite && (
                    <a 
                      href={customization.footer.developerWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-indigo-300 hover:text-white text-sm"
                    >
                      Visit Developer Website
                    </a>
                  )}
                  
                  {customization?.footer?.supportEmail && (
                    <a 
                      href={`mailto:${customization.footer.supportEmail}`} 
                      className="block text-indigo-300 hover:text-white text-sm"
                    >
                      Support: {customization.footer.supportEmail}
                    </a>
                  )}
                  
                  {customization?.footer?.documentationUrl && (
                    <a 
                      href={customization.footer.documentationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-indigo-300 hover:text-white text-sm"
                    >
                      Documentation
                    </a>
                  )}
                  
                  {customization?.footer?.versionInfo && (
                    <p className="text-gray-500 text-xs">
                      Version: {customization.footer.versionInfo}
                    </p>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </footer>
        
      {/* Styles for Rich Text Content */}
      <style>{`
        .footer-rich-content {
          color: inherit;
          max-width: 100%;
        }
        .footer-rich-content p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        .footer-rich-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        .footer-rich-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        .footer-rich-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        .footer-rich-content ul,
        .footer-rich-content ol {
          padding-left: 2rem;
          margin: 0.5rem 0;
        }
        .footer-rich-content li {
          margin: 0.25rem 0;
        }
        .footer-rich-content a {
          color: #60a5fa;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .footer-rich-content a:hover {
          opacity: 0.8;
        }
        /* Social media icon buttons */
        .footer-rich-content a[style*="background-color"] {
          display: inline-block;
          border-radius: 6px;
          transition: transform 0.2s, opacity 0.2s;
        }
        .footer-rich-content a[style*="background-color"]:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }
        .footer-rich-content img {
          max-width: 100%;
          height: auto;
          display: inline-block;
          margin: 0.5rem;
          border-radius: 4px;
          vertical-align: middle;
        }
        .footer-rich-content img:hover {
          opacity: 0.9;
        }
        .footer-rich-content strong {
          font-weight: bold;
        }
        .footer-rich-content em {
          font-style: italic;
        }
        .footer-rich-content u {
          text-decoration: underline;
        }
        .footer-rich-content s {
          text-decoration: line-through;
        }
        .footer-rich-content mark {
          padding: 0.1em 0.2em;
          border-radius: 2px;
        }
        .footer-rich-content ul {
          list-style-type: disc;
          list-style-position: outside;
        }
        .footer-rich-content ol {
          list-style-type: decimal;
          list-style-position: outside;
        }
        .footer-rich-content li {
          line-height: 1.6;
        }
        .footer-rich-content [style*="text-align: center"] {
          text-align: center;
        }
        .footer-rich-content [style*="text-align: right"] {
          text-align: right;
        }
        .footer-rich-content [style*="text-align: justify"] {
          text-align: justify;
        }
        /* Preserve inline styles for font sizes and colors */
        .footer-rich-content [style*="font-size"] {
          /* Preserve inline font-size */
        }
        .footer-rich-content [style*="color"] {
          /* Preserve inline color */
        }
        .footer-rich-content [style*="font-family"] {
          /* Preserve inline font-family */
        }
        /* Font Awesome icons in rich text content */
        .footer-rich-content .social-icon-badge i {
          font-family: 'Font Awesome 6 Brands', 'Font Awesome 6 Free';
          font-weight: 900;
          font-style: normal;
          font-variant: normal;
          text-rendering: auto;
          line-height: 1;
        }
      `}</style>
    </>
  );
};

export default PublicFooter;