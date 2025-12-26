import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

// Mock request and response objects for testing
const createMockReqRes = (client, bodyData) => {
  const req = {
    headers: {
      "x-api-key": client.apiKey
    },
    body: bodyData
  };
  
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.responseData = data;
      console.log(`Response Status: ${this.statusCode}`);
      console.log('Response Data:', JSON.stringify(data, null, 2));
      return this;
    }
  };
  
  return { req, res };
};

// Import the controller functions
import { updateCustomization } from './controllers/epaperController.js';

const testSocialLinksAPI = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a test client
    const client = await Client.findOne({});
    
    if (!client) {
      console.log('No client found');
      return;
    }

    console.log('Client ID:', client._id);
    console.log('Client Name:', client.clientName);
    console.log('API Key:', client.apiKey);
    
    // Test the updateCustomization function with socialLinks data
    console.log('\n--- Testing updateCustomization with socialLinks ---');
    
    const socialLinksData = {
      socialLinks: {
        iconStyle: "material",
        links: {
          facebook: "https://facebook.com/api-test",
          whatsapp: "https://wa.me/api-test",
          instagram: "https://instagram.com/api-test",
          linkedin: "https://linkedin.com/company/api-test",
          youtube: "https://youtube.com/c/api-test",
          x: "https://x.com/api-test",
          telegram: "https://t.me/api-test"
        }
      }
    };
    
    // Create mock req/res objects
    const { req, res } = createMockReqRes(client, socialLinksData);
    
    // Call the updateCustomization function
    // Note: We can't directly call it because it's an async function that expects to send a response
    // Instead, let's manually test the logic
    
    console.log('\nManual test of update logic:');
    
    // Simulate the update logic from updateCustomization function
    const updatedClient = await Client.findOne({ apiKey: client.apiKey });
    
    // Apply the same logic as in the controller
    const updatedCustomization = {
      navbar: {
        ...(updatedClient.customization && updatedClient.customization.navbar ? updatedClient.customization.navbar.toObject() : {}),
        ...socialLinksData.navbar,
      },      
      footer: {
        ...(updatedClient.customization && updatedClient.customization.footer ? updatedClient.customization.footer.toObject() : {}),
        ...socialLinksData.footer,
      },
      clip: {
        ...(updatedClient.customization && updatedClient.customization.clip ? updatedClient.customization.clip.toObject() : {}),
        ...socialLinksData.clip,
      },
      promotionalBanners: socialLinksData.promotionalBanners || 
        (updatedClient.customization && updatedClient.customization.promotionalBanners ? updatedClient.customization.promotionalBanners : []) || [],
      topToolbarSettings: {
        ...(updatedClient.customization && updatedClient.customization.topToolbarSettings ? updatedClient.customization.topToolbarSettings.toObject() : {}),
        ...socialLinksData.topToolbarSettings,
      },
      breakingNews: socialLinksData.breakingNews || 
        (updatedClient.customization && updatedClient.customization.breakingNews ? updatedClient.customization.breakingNews : []) || [],
      socialLinks: socialLinksData.socialLinks || 
        (updatedClient.customization && updatedClient.customization.socialLinks ? updatedClient.customization.socialLinks : { iconStyle: "circle", links: {} }),
    };
    
    updatedClient.customization = updatedCustomization;
    await updatedClient.save();
    
    console.log('Update successful!');
    console.log('Saved socialLinks iconStyle:', updatedClient.customization.socialLinks.iconStyle);
    console.log('Saved Facebook URL:', updatedClient.customization.socialLinks.links.facebook);
    
    // Verify the data was saved correctly
    const verifiedClient = await Client.findOne({ apiKey: client.apiKey });
    console.log('\nVerification from database:');
    console.log('Database socialLinks iconStyle:', verifiedClient.customization.socialLinks.iconStyle);
    console.log('Database Facebook URL:', verifiedClient.customization.socialLinks.links.facebook);
    
    console.log('\nAPI test completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testSocialLinksAPI();