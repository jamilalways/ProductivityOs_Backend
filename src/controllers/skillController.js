const Skill = require('../models/Skill');
const User  = require('../models/User');

exports.getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.json({ skills });
  } catch (err) { next(err); }
};

exports.createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create({ ...req.body, user: req.user.id });
    res.status(201).json({ skill });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create skill' });
  }
};

exports.updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json({ skill });
  } catch (err) { next(err); }
};

// PATCH /api/skills/:id/topics/:topicId/toggle
exports.toggleTopic = async (req, res, next) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const topic = skill.topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    topic.completed = !topic.completed;
    await skill.save();

    // Award XP when topic completed
    if (topic.completed) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: 20 } });
    }

    res.json({ skill });
  } catch (err) { next(err); }
};

// DELETE /api/skills/:id/topics/:topicId
exports.deleteTopic = async (req, res, next) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    skill.topics.pull(req.params.topicId);
    await skill.save();

    res.json({ skill });
  } catch (err) { next(err); }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.reorderSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills array is required' });
    }

    const updates = skills.map((sk) => ({
      updateOne: {
        filter: { _id: sk.id, user: req.user.id },
        update: { $set: { order: sk.order, category: sk.category } }
      }
    }));

    if (updates.length > 0) {
      await Skill.bulkWrite(updates);
    }

    res.json({ message: 'Skills reordered successfully' });
  } catch (err) { next(err); }
};
