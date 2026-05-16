const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, minlength: 6, select: false },
  avatar:        { type: String, default: '' },

  // Gamification
  xp:            { type: Number, default: 0 },
  level:         { type: Number, default: 1 },

  // Streaks
  streak:        { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate:{ type: Date },

  // Achievements
  achievements:  [{ type: String }],

  // Preferences
  theme:         { type: String, enum: ['dark', 'light'], default: 'dark' },
  notifications: {
    taskReminders:  { type: Boolean, default: true },
    deadlineAlerts: { type: Boolean, default: true },
  },
  mantra: { type: String, default: 'Consistency is key' },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
