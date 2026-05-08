const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:             { type: String, required: true, trim: true },
  icon:             { type: String, default: '✅' },
  color:            { type: String, default: '#10b981' },
  frequency:        { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  streak:           { type: Number, default: 0 },
  longestStreak:    { type: Number, default: 0 },
  completedDates:   [{ type: Date }],
  targetDaysPerWeek:{ type: Number, default: 7 },
}, { timestamps: true });

habitSchema.index({ user: 1 });

module.exports = mongoose.model('Habit', habitSchema);
