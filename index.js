require('dotenv').config();
const mineflayer = require('mineflayer');

function startBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: Number(process.env.MC_PORT),
    username: process.env.MC_USERNAME,
    version: false
  });

  bot.on('spawn', () => {
    console.log('✅ Bot دخل للسيرفر');

    // Anti-AFK متطور
    setInterval(() => {
      const actions = ['jump', 'forward', 'back', 'left', 'right'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      bot.setControlState(action, true);
      setTimeout(() => bot.setControlState(action, false), 800);

      bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI / 4);
    }, 30000);
  });

  bot.on('end', () => {
    console.log('🔁 خرج، إعادة الاتصال بعد 5 ثواني...');
    setTimeout(startBot, 5000);
  });

  bot.on('error', err => console.log('❌ Error:', err));
}

startBot();
