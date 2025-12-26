import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkClientApiKeys = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the clients collection directly
    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    
    // Find all clients and show their API keys
    const allClients = await clientsCollection.find({}).toArray();
    console.log(`Total clients: ${allClients.length}`);
    
    allClients.forEach((client, index) => {
      console.log(`\nClient ${index + 1}:`);
      console.log('  ID:', client._id);
      console.log('  Name:', client.clientName);
      console.log('  API Key:', client.apiKey);
      console.log('  Has customization:', !!client.customization);
      if (client.customization) {
        console.log('    Has socialLinks:', !!client.customization.socialLinks);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

checkClientApiKeys();