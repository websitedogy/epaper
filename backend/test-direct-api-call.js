import fetch from 'node-fetch';

const testDirectApiCall = async () => {
  try {
    console.log('Testing direct API call to update socialLinks...');
    
    const testData = {
      socialLinks: {
        iconStyle: "neon-glow",
        links: {
          facebook: "https://facebook.com/direct-api-test",
          whatsapp: "https://wa.me/direct-api-test",
          instagram: "https://instagram.com/direct-api-test",
          linkedin: "https://linkedin.com/company/direct-api-test",
          youtube: "https://youtube.com/c/direct-api-test",
          x: "https://x.com/direct-api-test",
          telegram: "https://t.me/direct-api-test"
        }
      }
    };
    
    console.log('Sending data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:5001/api/epaper/customization', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'ak_af7d228dbafed975a18bc9f8478c35b49ace62e3f4c484c6'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testDirectApiCall();