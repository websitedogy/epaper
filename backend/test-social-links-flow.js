// This script simulates the exact data flow for socialLinks saving
console.log("=== Social Links Data Flow Test ===");

// Simulate the initial state (what comes from the database)
const initialCustomization = {
  navbar: {
    // ... navbar data
  },
  footer: {
    // ... footer data
  },
  // ... other customization data
  socialLinks: {
    iconStyle: "circle",
    links: {
      facebook: "",
      whatsapp: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      x: "",
      telegram: ""
    }
  }
};

console.log("1. Initial customization from database:");
console.log(JSON.stringify(initialCustomization, null, 2));

// Simulate what the SocialMediaLinksSettings component does
const localCustomization = {
  iconStyle: "material",
  links: {
    facebook: "https://facebook.com/test",
    whatsapp: "https://wa.me/test",
    instagram: "https://instagram.com/test",
    linkedin: "https://linkedin.com/company/test",
    youtube: "https://youtube.com/c/test",
    x: "https://x.com/test",
    telegram: "https://t.me/test"
  }
};

console.log("\n2. Local customization in component:");
console.log(JSON.stringify(localCustomization, null, 2));

// This is what the current handleSave function does (INCORRECT)
const formattedCustomization_WRONG = {
  ...initialCustomization,
  socialLinks: {
    iconStyle: localCustomization.iconStyle,
    links: { ...localCustomization.links }
  }
};

console.log("\n3. What current handleSave produces (WRONG):");
console.log(JSON.stringify(formattedCustomization_WRONG, null, 2));

// This is what it SHOULD do
const formattedCustomization_CORRECT = {
  socialLinks: {
    iconStyle: localCustomization.iconStyle,
    links: { ...localCustomization.links }
  }
};

console.log("\n4. What handleSave SHOULD produce (CORRECT):");
console.log(JSON.stringify(formattedCustomization_CORRECT, null, 2));

console.log("\n=== Analysis ===");
console.log("The issue is that we're sending the ENTIRE customization object");
console.log("instead of just the socialLinks data.");
console.log("This can cause conflicts with other customization data.");