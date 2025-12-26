import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const removeSocialMediaStyles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the clients collection directly
    const db = mongoose.connection.db;
    const clientsCollection = db.collection('clients');
    
    // First, let's see how many documents have socialMediaStyles
    const docsWithSocialMediaStyles = await clientsCollection.find({ 
      "customization.socialMediaStyles": { $exists: true } 
    }).toArray();
    
    console.log(`Found ${docsWithSocialMediaStyles.length} documents with socialMediaStyles`);
    
    if (docsWithSocialMediaStyles.length > 0) {
      console.log('\nSample document IDs with socialMediaStyles:');
      docsWithSocialMediaStyles.slice(0, 3).forEach((doc, index) => {
        console.log(`  ${index + 1}. ID: ${doc._id}`);
      });
      
      // Remove socialMediaStyles from all documents
      console.log('\nRemoving socialMediaStyles from all documents...');
      const result = await clientsCollection.updateMany(
        { "customization.socialMediaStyles": { $exists: true } },
        { $unset: { "customization.socialMediaStyles": "" } }
      );
      
      console.log(`Successfully removed socialMediaStyles from ${result.modifiedCount} documents`);
    } else {
      console.log('No documents found with socialMediaStyles');
    }
    
    // Also remove selectedSocialMediaStyle if it exists
    const docsWitSelectedSocialMediaStyle = await clientsCollection.find({ 
      "customization.selectedSocialMediaStyle": { $exists: true } 
    }).toArray();
    
    console.log(`\nFound ${docsWitSelectedSocialMediaStyle.length} documents with selectedSocialMediaStyle`);
    
    if (docsWitSelectedSocialMediaStyle.length > 0) {
      console.log('Removing selectedSocialMediaStyle from documents...');
      const result = await clientsCollection.updateMany(
        { "customization.selectedSocialMediaStyle": { $exists: true } },
        { $unset: { "customization.selectedSocialMediaStyle": "" } }
      );
      
      console.log(`Successfully removed selectedSocialMediaStyle from ${result.modifiedCount} documents`);
    }
    
    console.log('\nCleanup completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

removeSocialMediaStyles();