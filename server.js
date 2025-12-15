require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Main Api
app.post('/api/assistant/command', async (req, res) => {
  const command = req.body.command?.toLowerCase();

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  // Time
  if (command.includes('time')) {
    return res.json({
      answer: `Current time is ${new Date().toLocaleTimeString()}`
    });
  }

  // Date
  if (command.includes('date')) {
    return res.json({
      answer: `Today's date is ${new Date().toDateString()}`
    });
  }


  // Default
  return res.json({
    answer: "Sorry, I don't understand that command yet."
  });
});

// Helper Function
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Server start 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Smart Assistant API running on port ${PORT}`);
});
