// Test script to verify socialLinks data in frontend
console.log("Testing socialLinks data structure...");

// Sample customization data from our API test
const sampleCustomization = {
  "socialLinks": {
    "links": {
      "facebook": "https://facebook.com/",
      "whatsapp": "https://wa.me/",
      "instagram": "https://instagram.com/",
      "linkedin": "https://linkedin.com/company/",
      "youtube": "https://youtube.com/c/direct-api-test",
      "x": "https://x.com/direct-api-test",
      "telegram": "https://t.me/direct-api-test"
    },
    "iconStyle": "rounded-gradient"
  }
};

console.log("Sample customization data:");
console.log(JSON.stringify(sampleCustomization, null, 2));

// Test the renderSocialMediaLinks function logic
const { iconStyle, links } = sampleCustomization.socialLinks;
console.log("\nExtracted data:");
console.log("iconStyle:", iconStyle);
console.log("links:", links);

const hasUrls = Object.values(links).some(url => url);
console.log("Has URLs:", hasUrls);

if (hasUrls) {
  console.log("\nURLs found:");
  Object.entries(links).forEach(([platform, url]) => {
    if (url) {
      console.log(`${platform}: ${url}`);
    }
  });
} else {
  console.log("No URLs found");
}