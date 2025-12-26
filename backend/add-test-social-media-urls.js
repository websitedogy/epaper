import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

const addTestSocialMediaUrls = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a test client (you may need to adjust this to find your specific client)
    const client = await Client.findOne({});
    
    if (!client) {
      console.log('No client found');
      return;
    }

    console.log('Client ID:', client._id);
    console.log('Client Name:', client.clientName);
    
    // Define test URLs for social media platforms
    const testUrls = {
      facebook: "https://facebook.com/testpage",
      whatsapp: "https://wa.me/1234567890",
      instagram: "https://instagram.com/testprofile",
      linkedin: "https://linkedin.com/company/testcompany",
      youtube: "https://youtube.com/channel/testchannel",
      x: "https://x.com/testprofile",
      telegram: "https://t.me/testgroup"
    };
    
    // Update the client's socialMediaStyles in customization
    if (!client.customization) {
      client.customization = {};
    }
    
    if (!client.customization.socialMediaStyles) {
      client.customization.socialMediaStyles = {};
    }
    
    // Update style1 with test URLs
    if (!client.customization.socialMediaStyles.style1) {
      client.customization.socialMediaStyles.style1 = {
        name: "Style 1",
        icons: {}
      };
    }
    
    client.customization.socialMediaStyles.style1.icons = { ...testUrls };
    
    // Set selected style
    client.customization.selectedSocialMediaStyle = "style1";
    
    // Save the client
    await client.save();
    
    console.log('\n✅ Test URLs added successfully!');
    console.log('Added URLs:');
    Object.keys(testUrls).forEach(platform => {
      console.log(`  ${platform}: ${testUrls[platform]}`);
    });
    
    // Verify the data was saved
    const updatedClient = await Client.findById(client._id);
    
    if (updatedClient.customization && updatedClient.customization.socialMediaStyles) {
      console.log('\n🔄 Verification - Saved URLs:');
      Object.keys(updatedClient.customization.socialMediaStyles.style1.icons).forEach(platform => {
        console.log(`  ${platform}: ${updatedClient.customization.socialMediaStyles.style1.icons[platform]}`);
      });
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

addTestSocialMediaUrls();