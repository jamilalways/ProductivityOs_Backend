const User          = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const user  = await User.create({ name, email, password });
    const token = generateToken(user._id);
    const { password: _p, ...safeUser } = user.toObject();

    res.status(201).json({ token, user: safeUser });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    // Update streak
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (user.lastActiveDate) {
      const last = new Date(user.lastActiveDate); last.setHours(0, 0, 0, 0);
      const diff = (today - last) / 86400000;
      if (diff === 1)      { user.streak += 1; if (user.streak > user.longestStreak) user.longestStreak = user.streak; }
      else if (diff > 1)   { user.streak = 1; }
    } else { user.streak = 1; }
    user.lastActiveDate = today;
    await user.save();

    const token = generateToken(user._id);
    const { password: _p, ...safeUser } = user.toObject();
    res.json({ token, user: safeUser });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
};

// PATCH /api/auth/update
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar', 'theme', 'notifications'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) { next(err); }
};
