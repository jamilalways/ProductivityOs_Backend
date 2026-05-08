const Task = require('../models/Task');
const User = require('../models/User');

const XP = { high: 30, medium: 15, low: 5 };

// GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { plannerType, status, date } = req.query;
    const q = { user: req.user.id };
    if (plannerType) q.plannerType = plannerType;
    if (status)      q.status      = status;
    if (date) {
      const d    = new Date(date);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      q.dueDate  = { $gte: d, $lt: next };
    }
    const tasks = await Task.find(q).sort({ order: 1, createdAt: -1 });
    res.json({ tasks });
  } catch (err) { next(err); }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user.id });
    res.status(201).json({ task });
  } catch (err) { next(err); }
};

// PATCH /api/tasks/reorder  (must be before /:id)
exports.reorderTasks = async (req, res, next) => {
  try {
    const { taskIds } = req.body;
    await Promise.all(
      taskIds.map((id, idx) =>
        Task.findOneAndUpdate({ _id: id, user: req.user.id }, { order: idx })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) { next(err); }
};

// PATCH /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Award XP on completion
    if (req.body.status === 'done') {
      const xp = XP[task.priority] || 10;
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp } });
    }

    res.json({ task });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
