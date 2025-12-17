require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client (if key exists)
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ONE SINGLE API
app.post('/api/assistant/command', async (req, res) => {
  const command = req.body.command?.toLowerCase();

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  
  // TIME
  if (command.includes('time')) {
    return res.json({
      answer: `Current time is ${new Date().toLocaleTimeString()}`
    });
  }

  // DATE
  
  if (command.includes('date')) {
    return res.json({
      answer: `Today's date is ${new Date().toDateString()}`
    });
  }

  // WEATHER
 
  if (command.includes('weather') || command.includes('rain')) {
    if (!process.env.WEATHER_API_KEY) {
      return res.json({ answer: 'Weather service not configured.' });
    }

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
        answer: 'Unable to fetch weather details right now.'
      });
    }
  }

 
  // PREDEFINED FREE ANSWERS (WORK WITHOUT OPENAI)
  
  const predefinedAnswers = {
    "who are you": "I am your smart automation assistant.",
    "what is nodejs": "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
    "what is javascript": "JavaScript is a programming language used for web development.",
    "what is mongodb": "MongoDB is a NoSQL document-based database."
  };

  if (predefinedAnswers[command]) {
    return res.json({ answer: predefinedAnswers[command] });
  }

  
  // RANDOM QUESTIONS USING OPENAI

  if (!openaiClient) {
    return res.json({
      answer: "I can answer time, date, and weather. AI service is not enabled."
    });
  }

  try {
    const aiResponse = await openaiClient.responses.create({
      model: 'gpt-4o-mini',
      input: command
    });

    return res.json({
      answer: aiResponse.output_text
    });
  } catch (error) {
    console.error("OPENAI ERROR:", error.response?.data || error.message);
    return res.json({
      answer: "Sorry, I couldn't answer that right now."
    });
  }
});


// HELPER FUNCTION
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Smart Assistant running on port ${PORT}`);
  console.log("Weather Key loaded:", !!process.env.WEATHER_API_KEY);
  console.log("OpenAI Key loaded:", !!process.env.OPENAI_API_KEY);
});
