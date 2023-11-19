const request = require('supertest');
const app = require('../index.js');
const db = require('../databasetemp.js');

const agent = request.agent(app);
let response2 = null;

beforeAll(async () => {
    await db.connect();
  
    const accountToAdd = {
      firstName: 'john',
      lastName: 'doe',
      userName: 'johndoe',
      email: 'john@gmail.com',
      password: 'password',
      confirmPassword: 'password',
    };
  
    const response1 = await request(app).post('/auth/register').send(accountToAdd);
    expect(response1.statusCode).toBe(201);
  
    const accountToLogin = {
      email: 'john@gmail.com',
      password: 'password',
    };
  
    response2 = await request(app).get('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(200);
  });

afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Create New Map Tests', () => {

    test('should create a new map for a Post request to /api/createNewMap WRITE TEST', async () => {
      
      const testMap = { //wihtout comments right now will add later when comments fixed
        name: 'MapName',
        userName: 'Username',
        ownerEmail: 'example@example.com',
        likes: ['like1', 'like2'],
        dislikes: ['dislike1', 'dislike2'],
        views: 100,
        date: new Date(),
        published: true,
        mapGeometry: { type: 'Point', coordinates: [0, 0] },
        mapFeatures: { feature1: 'Feature 1', feature2: 'Feature 2' },
        mapZoom: 10,
        mapCenter: [0, 0],
        previousCreators: ['Creator1', 'Creator2'],
        mapType: 1,
      }
  
      const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
      expect(response3.statusCode).toBe(201);
  });

  test('should fail create a new map (missing body) for a Post request to /api/createNewMap WRITE TEST', async () => {

    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send();
    expect(response3.statusCode).toBe(400);
    expect(response3.body.errorMessage).toBe("You must provide a Map");
    expect(response3.body.success).toBe(false);
});

test('should not create a new map (messed up map) for a Post request to /api/createNewMap WRITE TEST', async () => {
      
    const testMap = { //wihtout comments right now will add later when comments fixed
      dog: true,
      cat: 'Meow'
    }

    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
    expect(response3.statusCode).toBe(400);
    expect(response3.body.errorMessage).toBe("Poorly Formated Map");
});
  });
  