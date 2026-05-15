const mongoose = require('mongoose');
const User = require('../src/models/User');
const Analytics = require('../src/models/Analytics');
const Task = require('../src/models/Task');
const Skill = require('../src/models/Skill');
const Goal = require('../src/models/Goal');
require('dotenv').config();

async function resetStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ name: /Jamil/i });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log(`Resetting stats for ${user.name} (${user._id})`);

    // Reset User stats
    user.xp = 0;
    user.level = 1;
    user.streak = 0;
    user.longestStreak = 0;
    await user.save();

    // Delete Analytics
    await Analytics.deleteMany({ user: user._id });

    // Reset all tasks to todo
    await Task.updateMany({ user: user._id }, { status: 'todo' });

    // Reset all skill topics to uncompleted
    const skills = await Skill.find({ user: user._id });
    for (const skill of skills) {
      skill.topics.forEach(t => t.completed = false);
      await skill.save();
    }

    console.log('Stats reset successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetStats();
