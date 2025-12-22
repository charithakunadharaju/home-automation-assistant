require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

//TELEGRAM BOT SETUP

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN missing');
  process.exit(1);
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true
});

//CORE LOGIC

async function getAnswer(message) {
  const text = message.toLowerCase();

  //GREETINGS
  if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
    return 'Hello, How can I help you?';
  }

  if (text.includes('good morning')) {
    return 'Good morning, Have a great day!';
  }

  if (text.includes('good afternoon')) {
    return 'Good afternoon, Hope you are doing well!';
  }

  if (text.includes('good evening')) {
    return 'Good evening, How can I assist you?';
  }

  //TIME
  if (text.includes('time')) {
    return `Current time is ${new Date().toLocaleTimeString()}`;
  }

  //DATE
  if (text.includes('date')) {
    return `Today's date is ${new Date().toDateString()}`;
  }

  //DAY
  if (text.includes('day')) {
    return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`;
  }

  // WEATHER
  if (text.includes('weather') || text.includes('rain')) {
    if (!process.env.WEATHER_API_KEY) {
      return 'Weather service not configured.';
    }

    try {
      const cityMatch = text.match(/in\s+([a-zA-Z\s]+)/);
      const city = cityMatch ? cityMatch[1].trim() : 'hyderabad';

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
      const response = await axios.get(url);

      const weather = response.data.weather[0].description;
      const temp = response.data.main.temp;

      return `Weather in ${capitalize(city)} is ${weather} with ${temp}°C `;
    } catch (err) {
      return 'Unable to fetch weather details right now.';
    }
  }

  //FALLBACK
  return 'I can help with greetings, time, date, day, and weather ';
}

//REST API

app.post('/api/assistant/command', async (req, res) => {
  const command = req.body.command;

  if (!command) {
    return res.status(400).json({ answer: 'Command is required' });
  }

  const answer = await getAnswer(command);
  res.json({ answer });
});

//TELEGRAM HANDLER

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  const reply = await getAnswer(text);
  bot.sendMessage(chatId, reply);
});

//HELPER
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

//SERVER START

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(' Telegram bot is running...');
  console.log(' Weather Key loaded:', !!process.env.WEATHER_API_KEY);
});
