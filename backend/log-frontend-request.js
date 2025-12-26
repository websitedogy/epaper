// Add this to the epaperController.js to log what the frontend is sending
console.log('=== FRONTEND REQUEST RECEIVED ===');
console.log('Headers:', req.headers);
console.log('Body:', JSON.stringify(req.body, null, 2));
console.log('===================================');