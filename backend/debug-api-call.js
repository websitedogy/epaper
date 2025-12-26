import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// Mock endpoint to see what data is being sent
app.put('/api/epaper/customization', (req, res) => {
  console.log('=== API CALL RECEIVED ===');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================');
  
  res.json({
    success: true,
    data: req.body,
    message: "Mock response"
  });
});

app.listen(3001, () => {
  console.log('Debug server running on port 3001');
});