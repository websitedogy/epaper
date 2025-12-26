import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

const testApiCall = async () => {
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
    console.log('API Key:', client.apiKey);
    
    // Simulate the exact data structure that would be sent from the frontend
    const requestData = {
      socialLinks: {
        iconStyle: "material",
        links: {
          facebook: "https://facebook.com/api-test-real",
          whatsapp: "https://wa.me/api-test-real",
          instagram: "https://instagram.com/api-test-real",
          linkedin: "https://linkedin.com/company/api-test-real",
          youtube: "https://youtube.com/c/api-test-real",
          x: "https://x.com/api-test-real",
          telegram: "https://t.me/api-test-real"
        }
      }
    };
    
    console.log('\n--- Before Update ---');
    console.log('SocialLinks exists:', !!client.customization?.socialLinks);
    
    // Apply the exact same logic as in the updateCustomization function
    const updatedCustomization = {
      navbar: {
        ...(client.customization && client.customization.navbar ? client.customization.navbar.toObject() : {}),
      },      
      footer: {
        ...(client.customization && client.customization.footer ? client.customization.footer.toObject() : {}),
      },
      clip: {
        ...(client.customization && client.customization.clip ? client.customization.clip.toObject() : {}),
      },
      promotionalBanners: 
        (client.customization && client.customization.promotionalBanners ? client.customization.promotionalBanners : []) || [],
      topToolbarSettings: {
        ...(client.customization && client.customization.topToolbarSettings ? client.customization.topToolbarSettings.toObject() : {}),
      },
      breakingNews: 
        (client.customization && client.customization.breakingNews ? client.customization.breakingNews : []) || [],
      socialLinks: requestData.socialLinks || 
        (client.customization && client.customization.socialLinks ? client.customization.socialLinks : { iconStyle: "circle", links: {} }),
    };
    
    console.log('\n--- Updated Customization Object ---');
    console.log('SocialLinks in updated object:', updatedCustomization.socialLinks);
    
    // Assign and save
    client.customization = updatedCustomization;
    await client.save();
    
    console.log('\n--- After Save ---');
    // Fetch the client again to verify
    const updatedClient = await Client.findById(client._id);
    console.log('SocialLinks exists after save:', !!updatedClient.customization?.socialLinks);
    
    if (updatedClient.customization?.socialLinks) {
      console.log('SocialLinks data after save:');
      console.log('- Icon style:', updatedClient.customization.socialLinks.iconStyle);
      console.log('- Facebook URL:', updatedClient.customization.socialLinks.links.facebook);
    }
    
    // Test MongoDB query directly
    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    const queryResult = await clientsCollection.find({ "customization.socialLinks": { $exists: true } }).toArray();
    console.log('\n--- MongoDB Query Result ---');
    console.log('Query result count:', queryResult.length);
    
    console.log('\nTest completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testApiCall();