// Test script to verify socialLinks implementation
const mongoose = require('mongoose');

// MongoDB connection URI - replace with your actual connection string
const uri = "mongodb+srv://white_label_user:RGlN4UjBs2rAX9dJ@cluster0.ql4hh.mongodb.net/white_label_db?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");
  
  // Define the schema
  const customizationSchema = new mongoose.Schema({
    navbar: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    footer: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    socialLinks: {
      iconStyle: {
        type: String,
        default: "circle",
        enum: ["circle", "square-outline", "rounded-gradient", "flat-minimal", "shadow", "neon-glow", "material"]
      },
      links: {
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        x: { type: String, default: "" },
        telegram: { type: String, default: "" }
      }
    }
  });

  const clientSchema = new mongoose.Schema({
    epaperName: String,
    clientName: String,
    customization: customizationSchema
  });

  // Create the model
  const Client = mongoose.model('ClientTest', clientSchema);

  // Test data
  const testData = {
    epaperName: "Test E-Paper",
    clientName: "Test Client",
    customization: {
      navbar: {
        logoUrl: "https://example.com/logo.png",
        name: "Test Navbar"
      },
      footer: {
        copyright: "© 2023 Test Client"
      },
      socialLinks: {
        iconStyle: "circle",
        links: {
          facebook: "https://facebook.com/test",
          whatsapp: "https://wa.me/1234567890",
          instagram: "https://instagram.com/test",
          linkedin: "https://linkedin.com/company/test",
          youtube: "https://youtube.com/c/test",
          x: "https://x.com/test",
          telegram: "https://t.me/test"
        }
      }
    }
  };

  // Create and save a test client
  const testClient = new Client(testData);
  
  testClient.save()
    .then(savedClient => {
      console.log("Client saved successfully!");
      console.log("Saved client ID:", savedClient._id);
      console.log("Social Links data:", savedClient.customization.socialLinks);
      
      // Test updating the socialLinks
      return Client.findByIdAndUpdate(
        savedClient._id,
        {
          $set: {
            "customization.socialLinks": {
              iconStyle: "neon-glow",
              links: {
                facebook: "https://facebook.com/updated",
                whatsapp: "https://wa.me/0987654321",
                instagram: "https://instagram.com/updated",
                linkedin: "https://linkedin.com/company/updated",
                youtube: "https://youtube.com/c/updated",
                x: "https://x.com/updated",
                telegram: "https://t.me/updated"
              }
            }
          }
        },
        { new: true }
      );
    })
    .then(updatedClient => {
      console.log("\nClient updated successfully!");
      console.log("Updated socialLinks:", updatedClient.customization.socialLinks);
      
      // Test fetching the client
      return Client.findById(updatedClient._id);
    })
    .then(fetchedClient => {
      console.log("\nClient fetched successfully!");
      console.log("Fetched socialLinks:", fetchedClient.customization.socialLinks);
      
      // Clean up - delete the test client
      return Client.findByIdAndDelete(fetchedClient._id);
    })
    .then(deletedClient => {
      console.log("\nTest client deleted successfully!");
      console.log("Implementation verified - socialLinks functionality is working correctly!");
      mongoose.connection.close();
    })
    .catch(error => {
      console.error("Error:", error);
      mongoose.connection.close();
    });
})
.catch(error => {
  console.error("Connection error:", error);
});