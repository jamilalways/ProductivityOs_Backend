const Analytics = require('../models/Analytics');
const User      = require('../models/User');
const Task      = require('../models/Task');

exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = 'weekly' } = req.query;
    const days = { weekly: 7, monthly: 30, quarterly: 90, yearly: 365 }[period] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [analytics, user] = await Promise.all([
      Analytics.find({ user: req.user.id, date: { $gte: startDate } }).sort({ date: 1 }),
      User.findById(req.user.id),
    ]);

    // Build skill time map
    const skillTimeMap = {};
    analytics.forEach((day) => {
      day.skillTimeMinutes.forEach(({ skillName, minutes }) => {
        skillTimeMap[skillName] = (skillTimeMap[skillName] || 0) + minutes;
      });
    });

    res.json({
      analytics,
      summary: {
        totalTasksCompleted: analytics.reduce((a, d) => a + d.tasksCompleted, 0),
        totalXpEarned:       analytics.reduce((a, d) => a + d.xpEarned, 0),
        avgProductivityScore: analytics.length
          ? Math.round(analytics.reduce((a, d) => a + d.productivityScore, 0) / analytics.length)
          : 0,
        skillTimeMap,
        currentStreak:  user.streak,
        longestStreak:  user.longestStreak,
        level:          user.level,
        totalXp:        user.xp,
      },
    });
  } catch (err) { next(err); }
};

// Called internally by other controllers after task completion etc.
exports.logActivity = async (userId, data) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  await Analytics.findOneAndUpdate(
    { user: userId, date: today },
    { $inc: data },
    { upsert: true, new: true }
  );
};
