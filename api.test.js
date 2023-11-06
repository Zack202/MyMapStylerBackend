const request = require('supertest');
const app = require('./index.js');
const db = require('./databasetemp.js');

const agent = request.agent(app);

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Test build 1 backend', () => {
  
    test('should create a new name for a POST request to /api/name/:name WRITE TEST', async () => {
      const nameToAdd = 'john';
        
      const response = await request(app)
        .post(`/api/name/${nameToAdd}`); 
      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe(nameToAdd.name);
    });

    test('should return a list of names for a GET request to /api/names WRITE AND READ TEST', async () => {
        const nameToAdd = 'jimmy';

        const response2 = await request(app).post(`/api/name/${nameToAdd}`);
        expect(response2.statusCode).toBe(201);
        expect(response2.body.name).toBe(nameToAdd.name);

        const response = await request(app).get('/api/names');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
  });