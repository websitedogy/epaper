import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';
import Referral from './models/Referral.js';

dotenv.config();

const checkAllClientsEarnings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all clients with referral earnings
    const clients = await Client.find({
      referralEarnings: { $gt: 0 }
    }).select('clientName referralEarnings');
    
    console.log(`Found ${clients.length} clients with referral earnings:`);
    console.log('');
    
    for (const client of clients) {
      // Count their approved referrals
      const referralCount = await Referral.countDocuments({
        referringClientId: client._id,
        status: 'approved'
      });
      
      // Sum their referral amounts
      const referrals = await Referral.find({
        referringClientId: client._id,
        status: 'approved'
      });
      
      let totalFromReferrals = 0;
      referrals.forEach(referral => {
        totalFromReferrals += referral.referralAmount;
      });
      
      console.log(`Client: ${client.clientName}`);
      console.log(`  Database Earnings: ${client.referralEarnings}`);
      console.log(`  Calculated from Referrals: ${totalFromReferrals}`);
      console.log(`  Approved Referrals Count: ${referralCount}`);
      console.log(`  Difference: ${client.referralEarnings - totalFromReferrals}`);
      console.log('');
    }
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the function
checkAllClientsEarnings();