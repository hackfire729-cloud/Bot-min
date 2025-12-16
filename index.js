require('dotenv').config();
const mineflayer = require('mineflayer');

const rand = (a, b) => Math.random() * (b - a) + a;
const chance = p => Math.random() < p;

function startBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: Number(process.env.MC_PORT),
    username: process.env.MC_USERNAME,
    version: false
  });

  let state = 'idle'; // idle | move | observe
  let busy = false;

  bot.on('spawn', () => {
    console.log('🟢 NPC joined');

    // ===== Main behavior loop =====
    setInterval(() => {
      if (!bot.entity || busy) return;

      // long idle (human distraction)
      if (chance(0.45)) {
        state = 'idle';
        return;
      }

      // choose state
      state = chance(0.6) ? 'move' : 'observe';

      // ===== MOVE =====
      if (state === 'move') {
        const actions = ['forward', 'left', 'right'];
        const a = actions[Math.floor(Math.random() * actions.length)];

        bot.setControlState(a, true);
        setTimeout(() => {
          bot.setControlState(a, false);
        }, rand(500, 1800));

        // hesitation
        if (chance(0.25)) {
          setTimeout(() => {
            bot.setControlState(a, true);
            setTimeout(() => bot.setControlState(a, false), rand(300, 900));
          }, rand(300, 700));
        }
      }

      // ===== OBSERVE =====
      if (state === 'observe') {
        bot.look(
          bot.entity.yaw + rand(-0.4, 0.4),
          Math.max(-0.6, Math.min(0.6, bot.entity.pitch + rand(-0.15, 0.15))),
          true
        );
      }

    }, rand(20000, 45000));

    // ===== Rare jump (mistake) =====
    setInterval(() => {
      if (chance(0.05)) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 300);
      }
    }, 90000);

    // ===== Eat late (human forgetfulness) =====
    setInterval(() => {
      if (!bot.food || bot.food > 11 || busy) return;

      const food = bot.inventory.items().find(i =>
        ['bread', 'apple', 'cooked_beef', 'cooked_porkchop'].includes(i.name)
      );

      if (food && chance(0.7)) {
        busy = true;
        bot.equip(food, 'hand', () => {
          setTimeout(() => {
            bot.consume(() => (busy = false));
          }, rand(1500, 4000));
        });
      }
    }, 20000);

    // ===== Rare environment interaction =====
    setInterval(() => {
      if (busy || chance(0.9)) return;

      const block = bot.findBlock({
        matching: b => b.name === 'dirt' || b.name === 'sand',
        maxDistance: 3
      });

      if (block && chance(0.2)) {
        busy = true;
        bot.dig(block, () => {
          setTimeout(() => (busy = false), rand(800, 1500));
        });
      }
    }, 120000);
  });

  // ===== Safe reconnect only if forced =====
  bot.on('end', () => {
    console.log('🔄 Disconnected, reconnecting...');
    setTimeout(startBot, rand(8000, 15000));
  });

  bot.on('error', () => {});
}

startBot();
