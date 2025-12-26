import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

const testSocialMediaUrls = async () => {
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
    
    // Check if socialMediaStyles exist in customization
    if (client.customization && client.customization.socialMediaStyles) {
      console.log('\nSocial Media Styles:');
      Object.keys(client.customization.socialMediaStyles).forEach(styleKey => {
        const style = client.customization.socialMediaStyles[styleKey];
        console.log(`\n${styleKey}:`);
        console.log(`  Name: ${style.name}`);
        console.log(`  Icons:`);
        Object.keys(style.icons).forEach(platform => {
          console.log(`    ${platform}: ${style.icons[platform]}`);
        });
      });
    } else {
      console.log('No socialMediaStyles found in customization');
    }
    
    // Check selected social media style in customization
    console.log('\nSelected Social Media Style:', (client.customization && client.customization.selectedSocialMediaStyle) || 'None');
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testSocialMediaUrls();