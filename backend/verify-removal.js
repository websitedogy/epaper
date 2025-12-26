import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const verifyRemoval = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the clients collection directly
    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    
    // Check if socialMediaStyles still exists
    const docsWithSocialMediaStyles = await clientsCollection.find({ 
      "customization.socialMediaStyles": { $exists: true } 
    }).toArray();
    
    console.log(`Documents with socialMediaStyles: ${docsWithSocialMediaStyles.length}`);
    
    // Check if selectedSocialMediaStyle still exists
    const docsWithSelectedSocialMediaStyle = await clientsCollection.find({ 
      "customization.selectedSocialMediaStyle": { $exists: true } 
    }).toArray();
    
    console.log(`Documents with selectedSocialMediaStyle: ${docsWithSelectedSocialMediaStyle.length}`);
    
    // Verify socialLinks still exists
    const docsWithSocialLinks = await clientsCollection.find({ 
      "customization.socialLinks": { $exists: true } 
    }).toArray();
    
    console.log(`Documents with socialLinks: ${docsWithSocialLinks.length}`);
    
    if (docsWithSocialLinks.length > 0) {
      console.log('\n--- socialLinks verification ---');
      const client = docsWithSocialLinks[0];
      console.log('Client ID:', client._id);
      console.log('Client Name:', client.clientName);
      console.log('SocialLinks Icon Style:', client.customization?.socialLinks?.iconStyle);
      console.log('Facebook URL:', client.customization?.socialLinks?.links?.facebook);
    }
    
    // Show the structure of a client document
    const sampleClient = await clientsCollection.findOne({});
    if (sampleClient) {
      console.log('\n--- Sample Client Customization Structure ---');
      console.log('Has navbar:', !!sampleClient.customization?.navbar);
      console.log('Has footer:', !!sampleClient.customization?.footer);
      console.log('Has socialLinks:', !!sampleClient.customization?.socialLinks);
      console.log('Has socialMediaStyles:', !!sampleClient.customization?.socialMediaStyles);
      console.log('Has selectedSocialMediaStyle:', !!sampleClient.customization?.selectedSocialMediaStyle);
    }
    
    console.log('\nVerification completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

verifyRemoval();