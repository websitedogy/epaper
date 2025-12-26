import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const debugSocialLinksSave = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the clients collection directly
    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    
    // Find a test client
    const client = await clientsCollection.findOne({});
    
    if (!client) {
      console.log('No client found');
      return;
    }

    console.log('Client ID:', client._id);
    
    // Check current customization structure
    console.log('\n--- Before Update ---');
    console.log('SocialLinks exists:', !!client.customization?.socialLinks);
    
    // Let's try to update with a direct MongoDB update
    console.log('\n--- Performing Direct MongoDB Update ---');
    const updateResult = await clientsCollection.updateOne(
      { _id: client._id },
      { 
        $set: { 
          "customization.socialLinks": {
            iconStyle: "circle",
            links: {
              facebook: "https://facebook.com/debug",
              whatsapp: "https://wa.me/debug",
              instagram: "https://instagram.com/debug",
              linkedin: "https://linkedin.com/debug",
              youtube: "https://youtube.com/debug",
              x: "https://x.com/debug",
              telegram: "https://t.me/debug"
            }
          }
        }
      }
    );
    
    console.log('Update result - matched:', updateResult.matchedCount, 'modified:', updateResult.modifiedCount);
    
    // Check again
    console.log('\n--- After Direct Update ---');
    const updatedClient = await clientsCollection.findOne({ _id: client._id });
    console.log('SocialLinks exists:', !!updatedClient.customization?.socialLinks);
    
    if (updatedClient.customization?.socialLinks) {
      console.log('SocialLinks data:');
      console.log('- Icon style:', updatedClient.customization.socialLinks.iconStyle);
      console.log('- Facebook URL:', updatedClient.customization.socialLinks.links.facebook);
    }
    
    // Now let's test with a filter query to see if it's searchable
    console.log('\n--- Testing MongoDB Query ---');
    const queryResult = await clientsCollection.find({ "customization.socialLinks": { $exists: true } }).toArray();
    console.log('Query result count:', queryResult.length);
    
    if (queryResult.length > 0) {
      console.log('First result socialLinks exists:', !!queryResult[0].customization?.socialLinks);
    }
    
    console.log('\nDebug completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

debugSocialLinksSave();