import request from 'supertest';
import app from '../src/app';

describe('BookFlow LMS API Integration Test Suite', () => {
  it('GET /health - Should return system health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.system).toContain('Smart College Library Management System');
  });

  it('GET /api/v1/books - Should fetch public catalog list', async () => {
    const res = await request(app).get('/api/v1/books');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/auth/login - Should fail on invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@college.edu', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login - Should successfully authenticate demo Admin account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@college.edu', password: 'Admin@123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('ADMIN');
  });
});
