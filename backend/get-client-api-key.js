import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const getClientApiKey = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the clients collection directly
    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    
    // Find the client with socialLinks
    const client = await clientsCollection.findOne({ 
      "customization.socialLinks": { $exists: true } 
    });
    
    if (client) {
      console.log('Found client with socialLinks:');
      console.log('Client ID:', client._id);
      console.log('Client Name:', client.clientName);
      console.log('API Key:', client.apiKey);
      console.log('SocialLinks data:', JSON.stringify(client.customization.socialLinks, null, 2));
    } else {
      console.log('No client found with socialLinks');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

getClientApiKey();