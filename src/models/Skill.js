const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  completed:        { type: Boolean, default: false },
  notes:            { type: String, default: '' },
  timeSpentMinutes: { type: Number, default: 0 },
});

const skillSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:             { type: String, required: true, trim: true },
  category:         { type: String, enum: ['main', 'soft'], required: true },
  icon:             { type: String, default: '💡' },
  color:            { type: String, default: '#8b5cf6' },
  topics:           [topicSchema],
  totalTimeMinutes: { type: Number, default: 0 },
  order:            { type: Number, default: 0 },
}, { timestamps: true });

// Virtual: progress %
skillSchema.virtual('progressPercentage').get(function () {
  if (!this.topics.length) return 0;
  const done = this.topics.filter((t) => t.completed).length;
  return Math.round((done / this.topics.length) * 100);
});
skillSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Skill', skillSchema);
