import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const debugSocialLinksIssue = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the clients collection directly
    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    
    // Find a client with socialLinks
    const client = await clientsCollection.findOne({ 
      "customization.socialLinks": { $exists: true } 
    });
    
    if (client) {
      console.log('Found client with socialLinks:');
      console.log('Client ID:', client._id);
      console.log('Client Name:', client.clientName);
      console.log('SocialLinks data:', JSON.stringify(client.customization.socialLinks, null, 2));
    } else {
      console.log('No client found with socialLinks');
    }
    
    console.log('\n--- Checking all clients ---');
    const allClients = await clientsCollection.find({}).toArray();
    console.log(`Total clients: ${allClients.length}`);
    
    allClients.forEach((client, index) => {
      console.log(`\nClient ${index + 1}:`);
      console.log('  ID:', client._id);
      console.log('  Name:', client.clientName);
      console.log('  Has customization:', !!client.customization);
      if (client.customization) {
        console.log('    Has socialLinks:', !!client.customization.socialLinks);
        if (client.customization.socialLinks) {
          console.log('    SocialLinks:', JSON.stringify(client.customization.socialLinks, null, 2));
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

debugSocialLinksIssue();