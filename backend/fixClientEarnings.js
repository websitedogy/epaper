import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';
import Referral from './models/Referral.js';

dotenv.config();

const fixAllClientsEarnings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all clients with referral earnings
    const clients = await Client.find({
      referralEarnings: { $gte: 0 }
    });
    
    console.log(`Found ${clients.length} clients to process`);
    
    let updatedClients = 0;
    
    for (const client of clients) {
      // Calculate the correct earnings from referrals
      const referrals = await Referral.find({
        referringClientId: client._id,
        status: 'approved'
      });
      
      let correctEarnings = 0;
      referrals.forEach(referral => {
        correctEarnings += referral.referralAmount;
      });
      
      // Only update if there's a discrepancy
      if (client.referralEarnings !== correctEarnings) {
        console.log(`\nClient: ${client.clientName} (${client._id})`);
        console.log(`  Current earnings: ${client.referralEarnings}`);
        console.log(`  Correct earnings: ${correctEarnings}`);
        console.log(`  Difference: ${correctEarnings - client.referralEarnings}`);
        
        // Update the client's referral earnings
        const result = await Client.updateOne(
          { _id: client._id },
          { $set: { referralEarnings: correctEarnings } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`  Successfully updated client's referral earnings to ${correctEarnings}`);
          updatedClients++;
        } else {
          console.log('  No changes were made to the client document');
        }
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Processed ${clients.length} clients`);
    console.log(`Updated ${updatedClients} clients with discrepancies`);
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the function
fixAllClientsEarnings();