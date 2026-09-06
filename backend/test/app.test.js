const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');

test('GET /api/health returns an ok response', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, 'ok');
});

test('POST /api/orders rejects unauthenticated requests', async () => {
  const response = await request(app).post('/api/orders').send({});

  assert.equal(response.statusCode, 401);
  assert.match(response.body.message, /token/i);
});
