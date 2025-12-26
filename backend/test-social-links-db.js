import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

const testSocialLinksDB = async () => {
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
    
    // Check current customization structure
    console.log('\nCurrent customization structure:');
    console.log('Navbar exists:', !!client.customization?.navbar);
    console.log('Footer exists:', !!client.customization?.footer);
    console.log('SocialLinks exists:', !!client.customization?.socialLinks);
    
    if (client.customization?.socialLinks) {
      console.log('SocialLinks structure:');
      console.log('- Icon style:', client.customization.socialLinks.iconStyle);
      console.log('- Links object keys:', Object.keys(client.customization.socialLinks.links || {}));
    } else {
      console.log('Creating socialLinks structure...');
      
      // Create a complete customization object with all required fields
      const updatedCustomization = {
        ...(client.customization || {}),
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
      
      // Update the client
      const updatedClient = await Client.findByIdAndUpdate(
        client._id,
        { $set: { customization: updatedCustomization } },
        { new: true }
      );
      
      console.log('\nAfter update:');
      console.log('SocialLinks exists:', !!updatedClient.customization?.socialLinks);
      if (updatedClient.customization?.socialLinks) {
        console.log('SocialLinks structure:');
        console.log('- Icon style:', updatedClient.customization.socialLinks.iconStyle);
        console.log('- Links object keys:', Object.keys(updatedClient.customization.socialLinks.links || {}));
      }
    }
    
    // Test updating with actual data
    console.log('\nTesting update with actual data...');
    const testData = {
      iconStyle: "neon-glow",
      links: {
        facebook: "https://facebook.com/test",
        whatsapp: "https://wa.me/1234567890",
        instagram: "https://instagram.com/test",
        linkedin: "https://linkedin.com/company/test",
        youtube: "https://youtube.com/c/test",
        x: "https://x.com/test",
        telegram: "https://t.me/test"
      }
    };
    
    const finalClient = await Client.findByIdAndUpdate(
      client._id,
      { $set: { "customization.socialLinks": testData } },
      { new: true }
    );
    
    console.log('\nFinal test result:');
    console.log('SocialLinks iconStyle:', finalClient.customization.socialLinks.iconStyle);
    console.log('Facebook URL:', finalClient.customization.socialLinks.links.facebook);
    console.log('Instagram URL:', finalClient.customization.socialLinks.links.instagram);
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testSocialLinksDB();