const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');

const TEST_DB = 'mongodb://localhost:27017/productivity-os-test';

let token;

beforeAll(async () => {
  await mongoose.connect(TEST_DB);

  // Register + login to get token
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Task Tester', email: 'tasks@example.com', password: 'password123' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'tasks@example.com', password: 'password123' });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Task Routes', () => {
  let taskId;

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Study DSA', priority: 'high', plannerType: 'daily' });

      expect(res.statusCode).toBe(201);
      expect(res.body.task.title).toBe('Study DSA');
      expect(res.body.task.priority).toBe('high');
      taskId = res.body.task._id;
    });

    it('should reject task without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ priority: 'low' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Hacked task' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks for user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.length).toBeGreaterThan(0);
    });

    it('should filter by plannerType', async () => {
      const res = await request(app)
        .get('/api/tasks?plannerType=daily')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      res.body.tasks.forEach((t) => expect(t.plannerType).toBe('daily'));
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task status to done and award XP', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'done' });

      expect(res.statusCode).toBe(200);
      expect(res.body.task.status).toBe('done');
    });

    it('should return 404 for unknown task id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'done' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete the task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Deleted');
    });
  });
});
