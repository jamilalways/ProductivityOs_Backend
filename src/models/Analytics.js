const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:             { type: Date, required: true },
  tasksCompleted:   { type: Number, default: 0 },
  tasksCreated:     { type: Number, default: 0 },
  xpEarned:         { type: Number, default: 0 },
  habitsCompleted:  { type: Number, default: 0 },
  productivityScore:{ type: Number, default: 0 },   // 0-100
  skillTimeMinutes: [{
    skillId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    skillName: String,
    minutes:   Number,
  }],
}, { timestamps: true });

analyticsSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);