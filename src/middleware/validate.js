const validator = require('validator');

// ── Validate register / login body ────────────────────────────────────────────
exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2)
    return res.status(400).json({ message: 'Name must be at least 2 characters' });

  if (!email || !validator.isEmail(email))
    return res.status(400).json({ message: 'Please provide a valid email' });

  if (!password || password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validator.isEmail(email))
    return res.status(400).json({ message: 'Please provide a valid email' });

  if (!password)
    return res.status(400).json({ message: 'Password is required' });

  next();
};

// ── Validate task body ─────────────────────────────────────────────────────────
exports.validateTask = (req, res, next) => {
  const { title } = req.body;
  if (!title || title.trim().length === 0)
    return res.status(400).json({ message: 'Task title is required' });
  next();
};

// ── Validate goal body ─────────────────────────────────────────────────────────
exports.validateGoal = (req, res, next) => {
  const { title, type, deadline } = req.body;
  if (!title || title.trim().length === 0)
    return res.status(400).json({ message: 'Goal title is required' });
  if (!type || !['long-term', 'monthly', 'weekly'].includes(type))
    return res.status(400).json({ message: 'Goal type must be long-term, monthly, or weekly' });
  if (!deadline || isNaN(new Date(deadline)))
    return res.status(400).json({ message: 'Valid deadline is required' });
  next();
};
