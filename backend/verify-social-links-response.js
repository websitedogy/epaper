import fetch from 'node-fetch';

const verifySocialLinksResponse = async () => {
  try {
    // Use the API key from our previous test
    const apiKey = 'ak_af7d228dbafed975a18bc9f8478c35b49ace62e3f4c484c6';
    
    console.log('Verifying socialLinks response structure...');
    
    const response = await fetch('http://localhost:5001/api/epaper', {
      headers: {
        'x-api-key': apiKey
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API call successful');
      
      // Check if customization data exists
      if (data.data && data.data.customization) {
        console.log('✅ Customization data found');
        
        // Check if socialLinks data exists
        if (data.data.customization.socialLinks) {
          console.log('✅ socialLinks data found');
          console.log('socialLinks structure:');
          console.log(JSON.stringify(data.data.customization.socialLinks, null, 2));
          
          // Check iconStyle
          if (data.data.customization.socialLinks.iconStyle) {
            console.log('✅ iconStyle found:', data.data.customization.socialLinks.iconStyle);
          } else {
            console.log('❌ iconStyle NOT found');
          }
          
          // Check links
          if (data.data.customization.socialLinks.links) {
            console.log('✅ links object found');
            console.log('Links data:');
            Object.entries(data.data.customization.socialLinks.links).forEach(([platform, url]) => {
              if (url) {
                console.log(`  ${platform}: ${url}`);
              }
            });
          } else {
            console.log('❌ links object NOT found');
          }
        } else {
          console.log('❌ socialLinks data NOT found');
          console.log('Available customization keys:', Object.keys(data.data.customization));
        }
      } else {
        console.log('❌ Customization data NOT found');
      }
    } else {
      console.log('❌ API call failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

verifySocialLinksResponse();