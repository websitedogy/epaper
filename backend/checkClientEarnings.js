import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

const checkClientEarnings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find the client by ID
    const clientId = '6920a2a237c8d0a52f7527a2';
    const client = await Client.findById(clientId);
    
    if (client) {
      console.log('Client found:');
      console.log('Client Name:', client.clientName);
      console.log('Current Referral Earnings:', client.referralEarnings);
      console.log('Client ID:', client._id.toString());
    } else {
      console.log('Client not found');
    }
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the function
checkClientEarnings();