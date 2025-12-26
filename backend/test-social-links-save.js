import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testSocialLinksSave = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the Client model
    const Client = mongoose.model('Client', new mongoose.Schema({
      clientName: String,
      apiKey: String,
      customization: {
        navbar: {},
        footer: {},
        clip: {},
        promotionalBanners: [],
        topToolbarSettings: {},
        breakingNews: [],
        socialLinks: {
          iconStyle: { type: String, default: "circle" },
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
      }
    }));

    // Find the client with the API key we're using
    const client = await Client.findOne({ apiKey: "ak_af7d228dbafed975a18bc9f8478c35b49ace62e3f4c484c6" });
    
    if (client) {
      console.log('Found client:', client.clientName);
      
      // Simulate the data that would be sent from the frontend
      const testData = {
        socialLinks: {
          iconStyle: "neon-glow",
          links: {
            facebook: "https://facebook.com/test-update",
            whatsapp: "https://wa.me/test-update",
            instagram: "https://instagram.com/test-update",
            linkedin: "https://linkedin.com/company/test-update",
            youtube: "https://youtube.com/c/test-update",
            x: "https://x.com/test-update",
            telegram: "https://t.me/test-update"
          }
        }
      };
      
      console.log('Test data to save:', JSON.stringify(testData, null, 2));
      
      // Update the customization
      const updatedCustomization = {
        navbar: client.customization?.navbar || {},
        footer: client.customization?.footer || {},
        clip: client.customization?.clip || {},
        promotionalBanners: client.customization?.promotionalBanners || [],
        topToolbarSettings: client.customization?.topToolbarSettings || {},
        breakingNews: client.customization?.breakingNews || [],
        socialLinks: testData.socialLinks || 
          (client.customization && client.customization.socialLinks ? client.customization.socialLinks : { iconStyle: "circle", links: {} }),
      };
      
      console.log('Updated customization object:', JSON.stringify(updatedCustomization, null, 2));
      
      // Save to database
      client.customization = updatedCustomization;
      await client.save();
      
      console.log('Saved successfully!');
      
      // Verify the save
      const updatedClient = await Client.findById(client._id);
      console.log('Verified data in database:', JSON.stringify(updatedClient.customization.socialLinks, null, 2));
    } else {
      console.log('Client not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testSocialLinksSave();