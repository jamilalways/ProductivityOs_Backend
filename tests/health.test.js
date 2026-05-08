const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');

const TEST_DB = 'mongodb://localhost:27017/productivity-os-test';

beforeAll(async () => { await mongoose.connect(TEST_DB); });
afterAll(async () => { await mongoose.connection.close(); });

describe('Health & General', () => {
  it('GET /api/health should return OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('uptime');
  });

  it('Unknown route should return 404', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});
