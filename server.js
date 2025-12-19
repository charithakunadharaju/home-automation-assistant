require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

//TELEGRAM BOT SETUP

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is missing');
  process.exit(1);
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true
});

//CORE ANSWER FUNCTION
async function getAnswer(command) {
  const text = command.toLowerCase();

  // TIME
  if (text.includes('time')) {
    return `Current time is ${new Date().toLocaleTimeString()}`;
  }

  // DATE
  if (text.includes('date')) {
    return `Today's date is ${new Date().toDateString()}`;
  }

  // WEATHER
  if (text.includes('weather') || text.includes('rain')) {
    if (!process.env.WEATHER_API_KEY) {
      return 'Weather service is not configured.';
    }

    try {
      const cityMatch = text.match(/in\s+([a-zA-Z\s]+)/);
      const city = cityMatch ? cityMatch[1].trim() : 'hyderabad';

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
      const response = await axios.get(url);

      const weather = response.data.weather[0].description;
      const temp = response.data.main.temp;

      return `Current weather in ${capitalize(city)} is ${weather} with ${temp}°C`;
    } catch {
      return 'Unable to fetch weather details right now.';
    }
  }

  // FALLBACK
  return "I can help with time, date, and weather. More features coming soon.";
}


//RESTAPI
app.post('/api/assistant/command', async (req, res) => {
  const command = req.body.command;

  if (!command) {
    return res.status(400).json({
      answer: 'Command is required'
    });
  }

  const answer = await getAnswer(command);
  return res.json({ answer });
});


//TELEGRAM BOT HANDLER
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
if (!text) return;
const answer = await getAnswer(text);
  bot.sendMessage(chatId, answer);
});


//HELPER
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Smart Assistant running on port ${PORT}`);
  console.log('Telegram Bot running...');
  console.log('Weather Key loaded:', !!process.env.WEATHER_API_KEY);
});
