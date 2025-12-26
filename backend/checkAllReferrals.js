import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Referral from './models/Referral.js';

dotenv.config();

const checkAllReferrals = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all approved referrals for this client
    const clientId = '6920a2a237c8d0a52f7527a2';
    const referrals = await Referral.find({
      referringClientId: clientId,
      status: 'approved'
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${referrals.length} approved referrals for client ${clientId}:`);
    console.log('');
    
    let totalCalculatedEarnings = 0;
    
    referrals.forEach((referral, index) => {
      console.log(`Referral #${index + 1}:`);
      console.log(`  ID: ${referral._id}`);
      console.log(`  Amount: ${referral.referralAmount}`);
      console.log(`  Status: ${referral.status}`);
      console.log(`  Created: ${referral.createdAt}`);
      console.log('');
      
      totalCalculatedEarnings += referral.referralAmount;
    });
    
    console.log(`Total calculated earnings from all approved referrals: ${totalCalculatedEarnings}`);
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the function
checkAllReferrals();