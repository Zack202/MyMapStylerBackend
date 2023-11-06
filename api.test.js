const request = require('supertest');
const app = require('./index');



describe('API Endpoints', () => {
  it('should return a 200 status code for a GET request to /api', async () => {
    const response = await request(app).get('/auth/loggedIn');

    expect(response.statusCode).toBe(200);
  });

  // Add more test cases for your other endpoints
});

