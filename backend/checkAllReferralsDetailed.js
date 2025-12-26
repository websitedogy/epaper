import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Referral from './models/Referral.js';

dotenv.config();

const checkAllReferralsDetailed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all referrals for this client (any status)
    const clientId = '6920a2a237c8d0a52f7527a2';
    const referrals = await Referral.find({
      referringClientId: clientId
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${referrals.length} total referrals for client ${clientId}:`);
    console.log('');
    
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let totalApprovedAmount = 0;
    
    referrals.forEach((referral, index) => {
      console.log(`Referral #${index + 1}:`);
      console.log(`  ID: ${referral._id}`);
      console.log(`  Amount: ${referral.referralAmount}`);
      console.log(`  Status: ${referral.status}`);
      console.log(`  Created: ${referral.createdAt}`);
      console.log(`  Referred Client: ${referral.referredClientDetails?.name || 'N/A'}`);
      console.log('');
      
      if (referral.status === 'approved') {
        approvedCount++;
        totalApprovedAmount += referral.referralAmount;
      } else if (referral.status === 'pending') {
        pendingCount++;
      } else if (referral.status === 'rejected') {
        rejectedCount++;
      }
    });
    
    console.log('=== SUMMARY ===');
    console.log(`Total Referrals: ${referrals.length}`);
    console.log(`Approved: ${approvedCount} (Total Amount: ${totalApprovedAmount})`);
    console.log(`Pending: ${pendingCount}`);
    console.log(`Rejected: ${rejectedCount}`);
    console.log('');
    console.log(`Client's referralEarnings field shows: 1850`);
    console.log(`Calculated from referrals: ${totalApprovedAmount}`);
    console.log(`Difference: ${1850 - totalApprovedAmount}`);
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the function
checkAllReferralsDetailed();