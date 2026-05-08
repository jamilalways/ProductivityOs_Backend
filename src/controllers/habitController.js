const Habit = require('../models/Habit');
const User  = require('../models/User');

exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ habits });
  } catch (err) { next(err); }
};

exports.createHabit = async (req, res, next) => {
  try {
    const habit = await Habit.create({ ...req.body, user: req.user.id });
    res.status(201).json({ habit });
  } catch (err) { next(err); }
};

// POST /api/habits/:id/checkin
exports.checkIn = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const alreadyDone = habit.completedDates.some((d) => {
      const dd = new Date(d); dd.setHours(0, 0, 0, 0);
      return dd.getTime() === today.getTime();
    });
    if (alreadyDone) return res.status(400).json({ message: 'Already checked in today' });

    habit.completedDates.push(new Date());

    // Update streak
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const doneYesterday = habit.completedDates.some((d) => {
      const dd = new Date(d); dd.setHours(0, 0, 0, 0);
      return dd.getTime() === yesterday.getTime();
    });
    habit.streak = doneYesterday ? habit.streak + 1 : 1;
    if (habit.streak > habit.longestStreak) habit.longestStreak = habit.streak;

    await habit.save();
    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 10 } });

    res.json({ habit });
  } catch (err) { next(err); }
};

exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
