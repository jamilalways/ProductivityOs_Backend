const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority:    { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status:      { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  plannerType: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  dueDate:     { type: Date },
  goalId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  skillId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
  xpReward:    { type: Number, default: 10 },
  carriedOver: { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  tags:        [{ type: String }],
}, { timestamps: true });

taskSchema.index({ user: 1, plannerType: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
