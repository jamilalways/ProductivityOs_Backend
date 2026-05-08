const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true, trim: true },
  content:  { type: String, default: '' },          // Markdown
  type:     { type: String, enum: ['learning', 'problem-solution', 'general'], default: 'learning' },
  problem:  { type: String, default: '' },
  solution: { type: String, default: '' },
  tags:     [{ type: String }],
  skillId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
  date:     { type: Date, default: Date.now },
  pinned:   { type: Boolean, default: false },
}, { timestamps: true });

noteSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Note', noteSchema);
