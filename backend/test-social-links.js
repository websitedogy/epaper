import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

const testSocialLinks = async () => {
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
    
    // Check if socialLinks exist in customization
    if (client.customization && client.customization.socialLinks) {
      console.log('\nSocial Links:');
      console.log('Icon Style:', client.customization.socialLinks.iconStyle);
      console.log('Links:');
      Object.keys(client.customization.socialLinks.links).forEach(platform => {
        console.log(`  ${platform}: ${client.customization.socialLinks.links[platform]}`);
      });
    } else {
      console.log('No socialLinks found in customization');
      
      // Test creating socialLinks data
      console.log('\nCreating test socialLinks data...');
      
      // Update the client with socialLinks data
      const updatedClient = await Client.findByIdAndUpdate(
        client._id,
        {
          $set: {
            "customization.socialLinks": {
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
        },
        { new: true }
      );
      
      console.log('SocialLinks data created successfully!');
      console.log('Icon Style:', updatedClient.customization.socialLinks.iconStyle);
      console.log('Links:');
      Object.keys(updatedClient.customization.socialLinks.links).forEach(platform => {
        console.log(`  ${platform}: ${updatedClient.customization.socialLinks.links[platform]}`);
      });
    }
    
    // Test updating socialLinks
    console.log('\nUpdating socialLinks data...');
    
    const updatedClient = await Client.findByIdAndUpdate(
      client._id,
      {
        $set: {
          "customization.socialLinks.iconStyle": "neon-glow",
          "customization.socialLinks.links.facebook": "https://facebook.com/updated",
          "customization.socialLinks.links.instagram": "https://instagram.com/updated"
        }
      },
      { new: true }
    );
    
    console.log('SocialLinks data updated successfully!');
    console.log('Updated Icon Style:', updatedClient.customization.socialLinks.iconStyle);
    console.log('Updated Facebook URL:', updatedClient.customization.socialLinks.links.facebook);
    console.log('Updated Instagram URL:', updatedClient.customization.socialLinks.links.instagram);
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testSocialLinks();