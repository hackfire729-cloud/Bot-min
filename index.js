require('dotenv').config();
const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: Number(process.env.MC_PORT),
  username: process.env.MC_USERNAME,
  version: false
});

bot.on('spawn', () => {
  console.log('✅ Bot دخل للسيرفر');

  setInterval(() => {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
    bot.look(Math.random() * Math.PI * 2, 0);
  }, 60000);
});

bot.on('end', () => {
  console.log('❌ Bot خرج، إعادة التشغيل...');
  process.exit(1);
});

bot.on('error', err => console.log(err));
