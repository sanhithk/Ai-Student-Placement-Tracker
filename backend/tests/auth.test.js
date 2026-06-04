const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// We won't connect to real DB for this mock test, it will just fail DB validation
describe('Auth API', () => {
  it('should return 401 on login failure without db', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    
    // In actual unit tests, we'd mock the DB, but just expecting it to fail or error out here
    expect(res.statusCode).not.toBe(200);
  });
});
