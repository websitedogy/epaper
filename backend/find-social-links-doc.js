import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const findSocialLinksDoc = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the clients collection directly
    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    
    // Find all clients that have socialLinks
    const clientsWithSocialLinks = await clientsCollection.find({ 
      "customization.socialLinks": { $exists: true } 
    }).toArray();
    
    console.log('Found', clientsWithSocialLinks.length, 'client(s) with socialLinks');
    
    if (clientsWithSocialLinks.length > 0) {
      console.log('\n--- Client Details ---');
      clientsWithSocialLinks.forEach((client, index) => {
        console.log(`Client ${index + 1}:`);
        console.log('  ID:', client._id);
        console.log('  Name:', client.clientName);
        console.log('  Email:', client.email);
        console.log('  SocialLinks Icon Style:', client.customization?.socialLinks?.iconStyle);
        console.log('  Facebook URL:', client.customization?.socialLinks?.links?.facebook);
        console.log('');
      });
    } else {
      console.log('No clients found with socialLinks');
      
      // Let's check all clients to see what's in the database
      const allClients = await clientsCollection.find({}).toArray();
      console.log('\n--- All Clients ---');
      console.log('Total clients:', allClients.length);
      
      allClients.slice(0, 5).forEach((client, index) => {
        console.log(`Client ${index + 1}:`);
        console.log('  ID:', client._id);
        console.log('  Name:', client.clientName);
        console.log('  Email:', client.email);
        console.log('  Has socialLinks:', !!client.customization?.socialLinks);
        console.log('');
      });
    }
    
    console.log('\nTest completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

findSocialLinksDoc();