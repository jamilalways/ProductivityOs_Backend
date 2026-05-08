const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate:   { type: Date },
});

const goalSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type:        { type: String, enum: ['long-term', 'monthly', 'weekly'], required: true },
  progress:    { type: Number, min: 0, max: 100, default: 0 },
  deadline:    { type: Date, required: true },
  status:      { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  color:       { type: String, default: '#8b5cf6' },
  icon:        { type: String, default: '🎯' },
  milestones:  [milestoneSchema],
}, { timestamps: true });

goalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
