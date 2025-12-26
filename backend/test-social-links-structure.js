// Test script to verify socialLinks data structure in the backend response
console.log("Testing socialLinks data structure in backend response...");

// Sample response structure from our API test
const sampleResponse = {
  "success": true,
  "data": {
    "customization": {
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
        "iconStyle": "circle"
      }
    }
  }
};

console.log("Sample response structure:");
console.log(JSON.stringify(sampleResponse, null, 2));

// Extract socialLinks data
const socialLinks = sampleResponse.data.customization.socialLinks;
console.log("\nExtracted socialLinks data:");
console.log("iconStyle:", socialLinks.iconStyle);
console.log("links:", socialLinks.links);

// Test the frontend rendering logic
const { iconStyle, links } = socialLinks;
console.log("\nFrontend rendering test:");
console.log("iconStyle:", iconStyle);
console.log("links object:", links);

const hasUrls = Object.values(links).some(url => url);
console.log("Has URLs:", hasUrls);

if (hasUrls) {
  console.log("\nPlatforms with URLs:");
  Object.entries(links).forEach(([platform, url]) => {
    if (url) {
      console.log(`${platform}: ${url}`);
    }
  });
} else {
  console.log("No URLs found");
}

// Test style configuration lookup
const styleConfigs = {
  circle: {
    name: "Circle Icons",
    platforms: [
      { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#1877F2", shape: "circle" },
      { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#25D366", shape: "circle" },
      { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#E4405F", shape: "circle" },
      { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#0A66C2", shape: "circle" },
      { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FF0000", shape: "circle" },
      { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#000000", shape: "circle" },
      { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#0088CC", shape: "circle" }
    ]
  }
};

const currentStyle = styleConfigs[iconStyle] || styleConfigs.circle;
console.log("\nCurrent style configuration:");
console.log("Style name:", currentStyle.name);
console.log("Platforms:", currentStyle.platforms.map(p => p.name));

// Test filtering platforms with URLs
const filteredPlatforms = currentStyle.platforms.filter(platform => links[platform.key]);
console.log("\nFiltered platforms with URLs:");
filteredPlatforms.forEach(platform => {
  console.log(`${platform.name} (${platform.key}): ${links[platform.key]}`);
});