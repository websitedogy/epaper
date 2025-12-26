import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const testSocialLinksResponse = async () => {
  try {
    // Use the API key from the debug script output
    const apiKey = 'ak_af7d228dbafed975a18bc9f8478c35b49ace62e3f4c484c6'; // Replace with actual API key
    
    console.log('Testing socialLinks response...');
    
    const response = await fetch('http://localhost:5001/api/epaper', {
      headers: {
        'x-api-key': apiKey
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API call successful');
      console.log('Customization data:');
      console.log(JSON.stringify(data.data.customization, null, 2));
      
      if (data.data.customization.socialLinks) {
        console.log('✅ socialLinks found in response:');
        console.log(JSON.stringify(data.data.customization.socialLinks, null, 2));
      } else {
        console.log('❌ socialLinks NOT found in response');
      }
    } else {
      console.log('❌ API call failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testSocialLinksResponse();