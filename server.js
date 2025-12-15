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

// Weather / Rain
  if (command.includes('weather') || command.includes('rain')) {
    try {
      const cityMatch = command.match(/in\s+([a-zA-Z\s]+)/);
      const city = cityMatch ? cityMatch[1].trim() : 'hyderabad';

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
      const response = await axios.get(url);

      const weather = response.data.weather[0].description;
      const temp = response.data.main.temp;

      return res.json({
        answer: `Current weather in ${capitalize(city)} is ${weather} with ${temp}°C`
      });
    } catch (error) {
      return res.json({
        answer: 'Unable to fetch weather details.'
      });
    }
  }

// Server start 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Smart Assistant API running on port ${PORT}`);
});
