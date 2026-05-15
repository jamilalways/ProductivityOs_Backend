const Task = require('../models/Task');
const User = require('../models/User');
const analyticsCtrl = require('./analyticsController');

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
    
    // Log creation
    await analyticsCtrl.logActivity(req.user.id, { tasksCreated: 1 });
    
    res.status(201).json({ task });
  } catch (err) { next(err); }
};

// PATCH /api/tasks/reorder  (must be before /:id)
exports.reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Tasks array is required' });
    }

    // 1. Fetch existing tasks to compare status changes
    const taskIds = tasks.map(t => t.id);
    const existingTasks = await Task.find({ _id: { $in: taskIds }, user: req.user.id });
    const existingMap = existingTasks.reduce((acc, t) => {
      acc[t._id.toString()] = t;
      return acc;
    }, {});

    const updates = [];
    let totalXpDelta = 0;
    let totalTasksCompletedDelta = 0;
    let totalProductivityDelta = 0;

    for (const t of tasks) {
      const existing = existingMap[t.id];
      if (!existing) continue;

      updates.push({
        updateOne: {
          filter: { _id: t.id, user: req.user.id },
          update: { $set: { order: t.order, status: t.status } }
        }
      });

      // 2. Detect status change to/from 'done'
      const prevStatus = existing.status;
      const newStatus  = t.status;

      if (prevStatus !== 'done' && newStatus === 'done') {
        const xp = XP[existing.priority] || 10;
        totalXpDelta += xp;
        totalTasksCompletedDelta += 1;
        totalProductivityDelta += 10;
      } else if (prevStatus === 'done' && newStatus !== 'done') {
        const xp = XP[existing.priority] || 10;
        totalXpDelta -= xp;
        totalTasksCompletedDelta -= 1;
        totalProductivityDelta -= 10;
      }
    }

    if (updates.length > 0) {
      await Task.bulkWrite(updates);
    }

    // 3. Apply cumulative analytics changes
    if (totalXpDelta !== 0 || totalTasksCompletedDelta !== 0) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: totalXpDelta } });
      await analyticsCtrl.logActivity(req.user.id, {
        tasksCompleted: totalTasksCompletedDelta,
        xpEarned: totalXpDelta,
        productivityScore: totalProductivityDelta
      });
    }

    res.json({ message: 'Tasks reordered successfully' });
  } catch (err) { next(err); }
};

// PATCH /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const prevStatus = task.status;
    const newStatus  = req.body.status;

    Object.assign(task, req.body);
    await task.save();

    // XP and Analytics Logic
    const xp = XP[task.priority] || 10;

    if (prevStatus !== 'done' && newStatus === 'done') {
      // Completed: Increment
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp } });
      await analyticsCtrl.logActivity(req.user.id, { 
        tasksCompleted: 1, 
        xpEarned: xp,
        productivityScore: 10 
      });
    } else if (prevStatus === 'done' && newStatus !== 'done') {
      // Un-completed: Decrement
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: -xp } });
      await analyticsCtrl.logActivity(req.user.id, { 
        tasksCompleted: -1, 
        xpEarned: -xp,
        productivityScore: -10 
      });
    }

    res.json({ task });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.status === 'done') {
      const xp = XP[task.priority] || 10;
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: -xp } });
      await analyticsCtrl.logActivity(req.user.id, { 
        tasksCompleted: -1, 
        xpEarned: -xp,
        productivityScore: -10 
      });
    }

    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
