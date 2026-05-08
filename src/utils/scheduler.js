const cron = require('node-cron');

const startScheduler = () => {
  // ── Daily midnight: carry over incomplete daily tasks ──────────────────────
  cron.schedule('0 0 * * *', async () => {
    const Task = require('mongoose').model('Task');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const incomplete = await Task.find({
      plannerType: 'daily',
      status: { $ne: 'done' },
      dueDate: { $gte: yesterday, $lte: endOfYesterday },
    });

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    await Promise.all(
      incomplete.map((t) => Task.findByIdAndUpdate(t._id, { dueDate: today, carriedOver: true }))
    );
    console.log(`[Scheduler] Carried over ${incomplete.length} tasks`);
  });

  // ── Hourly: deadline alerts (extend with email/push later) ─────────────────
  cron.schedule('0 * * * *', () => {
    console.log('[Scheduler] Checking deadlines...');
  });
};

module.exports = { startScheduler };
