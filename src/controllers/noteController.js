const Note = require('../models/Note');
const User = require('../models/User');

exports.getNotes = async (req, res, next) => {
  try {
    const { type, pinned } = req.query;
    const q = { user: req.user.id };
    if (type)   q.type   = type;
    if (pinned) q.pinned = pinned === 'true';
    const notes = await Note.find(q).sort({ pinned: -1, date: -1 });
    res.json({ notes });
  } catch (err) { next(err); }
};

exports.createNote = async (req, res, next) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 5 } });
    res.status(201).json({ note });
  } catch (err) { next(err); }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ note });
  } catch (err) { next(err); }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
