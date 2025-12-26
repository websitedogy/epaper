import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Direct database inspection without using the model
const inspectClientDocument = async () => {
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
    console.log('Client Name:', client.clientName);
    
    // Inspect the full document structure
    console.log('\n--- Full Document Structure ---');
    console.log(JSON.stringify(client, null, 2));
    
    // Check customization structure specifically
    console.log('\n--- Customization Structure ---');
    if (client.customization) {
      console.log('Customization exists:', true);
      console.log('Navbar exists:', !!client.customization.navbar);
      console.log('Footer exists:', !!client.customization.footer);
      console.log('SocialLinks exists:', !!client.customization.socialLinks);
      
      if (client.customization.socialLinks) {
        console.log('\nSocialLinks structure:');
        console.log('- Icon style:', client.customization.socialLinks.iconStyle);
        console.log('- Links:', client.customization.socialLinks.links);
      } else {
        console.log('\nSocialLinks does not exist in this document');
        
        // Let's try to add it manually
        console.log('\nAdding socialLinks structure...');
        const result = await clientsCollection.updateOne(
          { _id: client._id },
          { 
            $set: { 
              "customization.socialLinks": {
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
            }
          }
        );
        
        console.log('Update result:', result.modifiedCount, 'document(s) modified');
        
        // Check again
        const updatedClient = await clientsCollection.findOne({ _id: client._id });
        console.log('\nAfter update - SocialLinks exists:', !!updatedClient.customization.socialLinks);
        if (updatedClient.customization.socialLinks) {
          console.log('SocialLinks structure:');
          console.log('- Icon style:', updatedClient.customization.socialLinks.iconStyle);
        }
      }
    } else {
      console.log('Customization does not exist in this document');
    }
    
    console.log('\nInspection completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

inspectClientDocument();