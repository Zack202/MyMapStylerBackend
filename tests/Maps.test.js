const request = require('supertest');
const app = require('../index.js');
const db = require('../databasetemp.js');
const { response } = require('express');
const jsonDiff = require('json-diff');

const agent = request.agent(app);
let response2 = null;

beforeAll(async () => {
    await db.connect();
  });

afterEach(async () => await db.clear());
afterAll(async () => await db.close());

const accountToAdd = {
  firstName: 'john',
  lastName: 'doe',
  userName: 'johndoe',
  email: 'john@gmail.com',
  password: 'password',
  confirmPassword: 'password',
};

const accountToLogin = {
  email: 'john@gmail.com',
  password: 'password',
};

const testMap = { //wihtout comments right now will add later when comments fixed
  name: 'MapName',
  userName: 'johndoe',
  ownerEmail: 'john@gmail.com',
  likes: ['like1', 'like2'],
  dislikes: ['dislike1', 'dislike2'],
  views: 100,
  date: new Date(),
  published: true,
  mapGeometry: { type: 'Point', coordinates: [0, 0] },
  mapFeatures: {
    "ADV": [],
    "DP": [],
    "edits": {
        "mapColor": "maroon",
      "borderSwitch": false,
      "borderWidth": 1,
      "borderColor": "#000000",
      "regionSwitch": false,
      "regionNameColor": "#000000",
      "backgroundColor": "#ffffff",
      "center": [0, 0],
      "zoom": 1
    }
},
  mapZoom: 1,
  mapCenter: [0, 0],
  previousCreators: ['Creator1', 'Creator2'],
  mapType: 1,
  description: 'MapDescription',
}

describe('Create New Map Tests', () => {

    test('should create a new map for a Post request to /api/createNewMap WRITE TEST', async () => {
        
          const response1 = await request(app).post('/auth/register').send(accountToAdd);
          expect(response1.statusCode).toBe(201);
        
        
          response2 = await request(app).post('/auth/login').send(accountToLogin);
          expect(response2.statusCode).toBe(200);
  
      const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
      expect(response3.statusCode).toBe(201);
  });

    test('should fail create a new map (missing body) for a Post request to /api/createNewMap WRITE TEST', async () => {
        
          const response1 = await request(app).post('/auth/register').send(accountToAdd);
          expect(response1.statusCode).toBe(201);
        
          response2 = await request(app).post('/auth/login').send(accountToLogin);
          expect(response2.statusCode).toBe(200);
      
    
    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send();
    expect(response3.statusCode).toBe(400);
    expect(response3.body.errorMessage).toBe("You must provide a Map file.");
    });

    test('should not create a new map (messed up map) for a Post request to /api/createNewMap WRITE TEST', async () => {
        
          const response1 = await request(app).post('/auth/register').send(accountToAdd);
          expect(response1.statusCode).toBe(201);

        
          response2 = await request(app).post('/auth/login').send(accountToLogin);
          expect(response2.statusCode).toBe(200);
      
    
    const testMap = { //wihtout comments right now will add later when comments fixed
      dog: true,
      cat: 'Meow'
    }

    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
    expect(response3.statusCode).toBe(400);
    });
});


describe('Update Map Tests', () => {

    // test('should update a map for a Put request to /api/updateMap WRITE TEST', async () => {
        
    //       const response1 = await request(app).post('/auth/register').send(accountToAdd);
    //       expect(response1.statusCode).toBe(201);
        
    //       const accountToLogin = {
    //         email: 'john@gmail.com',
    //         password: 'password',
    //       };
        
    //       response2 = await request(app).post('/auth/login').send(accountToLogin);
    //       expect(response2.statusCode).toBe(200);
      
    
    //     const testMap = { //wihtout comments right now will add later when comments fixed
    //         name: 'MapName',
    //         userName: 'Username',
    //         ownerEmail: 'john@gmail.com',
    //         likes: ['like1', 'like2'],
    //         dislikes: ['dislike1', 'dislike2'],
    //         views: 100,
    //         date: new Date(),
    //         published: true,
    //         mapGeometry: { type: 'Point', coordinates: [0, 0] },
    //         mapFeatures: { feature1: 'Feature 1', feature2: 'Feature 2' },
    //         mapZoom: 10,
    //         mapCenter: [0, 0],
    //         previousCreators: ['Creator1', 'Creator2'],
    //         mapType: 1,
    //         description: 'MapDescription',
    //       }
      
    //       const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
    //       expect(response3.statusCode).toBe(201);
    //       console.log(response3.body.map._id);

    //       let modifiedTestMap = {
    //         ...testMap,
    //         name: 'UpdatedMapName',
    //     };
    //     diff = jsonDiff.diff(testMap, modifiedTestMap);
    //     const response4 = await request(app).put('/api/updateMap/'+ response3.body.map._id).set('Cookie', response2.headers['set-cookie']).send(diff);
    //     expect(response4.statusCode).toBe(200);
    //     expect(response4.body.success).toBe(true);
    // });

    test('should fail update a map (wrong owner) for a Put request to /api/updateMap WRITE TEST', async () => {
        
          const response1 = await request(app).post('/auth/register').send(accountToAdd);
          expect(response1.statusCode).toBe(201);
        
          const accountToLogin = {
            email: 'john@gmail.com',
            password: 'password',
          };
        
          response2 = await request(app).post('/auth/login').send(accountToLogin);
          expect(response2.statusCode).toBe(200);
      
    
        const testMap = { //wihtout comments right now will add later when comments fixed
            name: 'MapName',
            userName: 'Username',
            ownerEmail: 'john2@gmail.com',
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
            description: 'MapDescription',
          }
      
          const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
          expect(response3.statusCode).toBe(201);
          console.log(response3.body.map._id);

        testMap.name = 'New Map Name';

        const response4 = await request(app).put('/api/updateMap/' + response3.body.map._id).set('Cookie', response2.headers['set-cookie']).send(testMap);
        expect(response4.statusCode).toBe(404);
        expect(response4.body.success).toBe(false);
    });

});

describe('Delete Map Tests', () => {
  
      test('should delete a map for a Get request to /api/deleteMap WRITE TEST', async () => {
          
            const response1 = await request(app).post('/auth/register').send(accountToAdd);
            expect(response1.statusCode).toBe(201);

            const accountToLogin = {
              email: 'john@gmail.com',
              password: 'password',
            };

            response2 = await request(app).post('/auth/login').send(accountToLogin);
            expect(response2.statusCode).toBe(200);

            const testMap = { //wihtout comments right now will add later when comments fixed
              name: 'MapName',
              userName: 'johndoe',
              ownerEmail: 'john@gmail.com',
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
              description: 'MapDescription',
            }

            const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
            expect(response3.statusCode).toBe(201);

            console.log(response3.body.map._id);
            const response4 = await request(app).get('/api/deleteMap/' + response3.body.map._id).set('Cookie', response2.headers['set-cookie']).send();
            expect(response4.statusCode).toBe(200);
            expect(response4.body.success).toBe(true);
        });

        test('should fail to delete a map (wrong id) for a Get request to /api/deleteMap WRITE TEST', async () => {
          
            const response1 = await request(app).post('/auth/register').send(accountToAdd);
            expect(response1.statusCode).toBe(201);

            const accountToLogin = {
              email: 'john@gmail.com',
              password: 'password',
            };

            response2 = await request(app).post('/auth/login').send(accountToLogin);
            expect(response2.statusCode).toBe(200);

            const testMap = { //wihtout comments right now will add later when comments fixed
              name: 'MapName',
              userName: 'johndoe',
              ownerEmail: 'john@gmail.com',
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
              description: 'MapDescription',
            }

            const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
            expect(response3.statusCode).toBe(201);

            const response4 = await request(app).get('/api/deleteMap/fake').set('Cookie', response2.headers['set-cookie']).send();
            expect(response4.body.success).toBe(false);
        });

        test('should fail to delete a map (wrong user) for a Get request to /api/deleteMap WRITE TEST', async () => {
          
            const response1 = await request(app).post('/auth/register').send(accountToAdd);
            expect(response1.statusCode).toBe(201);

            const accountToLogin = {
              email: 'john@gmail.com',
              password: 'password',
            };

            response2 = await request(app).post('/auth/login').send(accountToLogin);
            expect(response2.statusCode).toBe(200);

            const testMap = { //wihtout comments right now will add later when comments fixed
              name: 'MapName',
              userName: 'johndoe1',
              ownerEmail: 'john1@gmail.com',
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
              description: 'MapDescription',
            }

            const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
            expect(response3.statusCode).toBe(201);

            console.log(response3.body.map._id);
            const response4 = await request(app).get('/api/deleteMap/' + response3.body.map._id).set('Cookie', response2.headers['set-cookie']).send();
            expect(response4.statusCode).toBe(404);
            expect(response4.body.success).toBe(false);
        });
        

      });

describe('Get Map Pairs Tests', () => {

  test('should get pairs for Get request to /api/getMapPairs READ TEST', async () => {
    
      const response1 = await request(app).post('/auth/register').send(accountToAdd);
      expect(response1.statusCode).toBe(201);
    
      response2 = await request(app).post('/auth/login').send(accountToLogin);
      expect(response2.statusCode).toBe(200);

      const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
      expect(response3.statusCode).toBe(201);

      const response4 = await request(app).get('/api/mapPairs').set('Cookie', response2.headers['set-cookie']).send();
      expect(response4.statusCode).toBe(200);
  });
});


describe('Get Map Pairs Published Tests', () => {

  test('should get pairs published for Get request to /api/getMapPairsPublished READ TEST', async () => {
    
      const response1 = await request(app).post('/auth/register').send(accountToAdd);
      expect(response1.statusCode).toBe(201);
    
      response2 = await request(app).post('/auth/login').send(accountToLogin);
      expect(response2.statusCode).toBe(200);

      const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
      expect(response3.statusCode).toBe(201);

      const response4 = await request(app).get('/api/mapPairsPublished').set('Cookie', response2.headers['set-cookie']).send();
      expect(response4.statusCode).toBe(200);
      expect(response4.body.success).toBe(true);
      expect(response4.body.idNamePairs.length).toBe(1);
  });

  test('should not get pairs published (none published) for Get request to /api/getMapPairsPublished READ TEST', async () => {
    
    const response1 = await request(app).post('/auth/register').send(accountToAdd);
    expect(response1.statusCode).toBe(201);
  
    response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(200);

    let modifiedTestMap = {
                  ...testMap,
                  published: false,
              };

    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(modifiedTestMap);
    expect(response3.statusCode).toBe(201);

    const response4 = await request(app).get('/api/mapPairsPublished').set('Cookie', response2.headers['set-cookie']).send();
    expect(response4.statusCode).toBe(200);
    expect(response4.body.success).toBe(true);
    expect(response4.body.idNamePairs.length).toBe(0);
});
});

describe('Get Map By Id Tests', () => {
  test('should get map by id for Get request to /api/map/:id READ TEST', async () => {

    const response1 = await request(app).post('/auth/register').send(accountToAdd);
    expect(response1.statusCode).toBe(201);

    response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(200);

    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
    expect(response3.statusCode).toBe(201);

    const response4 = await request(app).get('/api/map/' + response3.body.map._id).set('Cookie', response2.headers['set-cookie']).send();
    expect(response4.statusCode).toBe(200);

  });

  test('should get map by id for Get request to /api/map/:id READ TEST', async () => {

    const response1 = await request(app).post('/auth/register').send(accountToAdd);
    expect(response1.statusCode).toBe(201);

    response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(200);

    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
    expect(response3.statusCode).toBe(201);

    const response4 = await request(app).get('/api/map/fake').set('Cookie', response2.headers['set-cookie']).send();
    expect(response4.statusCode).toBe(400);

  });


});

describe('Update Map Attributes By Id Tests', () => {

  test('should update map attributes by id for Put request to /api/updateMap/:id WRITE TEST', async () => {
    const response1 = await request(app).post('/auth/register').send(accountToAdd);
    expect(response1.statusCode).toBe(201);

    response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(200);

    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
    expect(response3.statusCode).toBe(201);

      let mapColor = "green"
      let borderSwitch = testMap.mapFeatures.edits.borderSwitch;
      let borderWidth = testMap.mapFeatures.edits.borderWidth;
      let borderColor = testMap.mapFeatures.edits.borderColor;
      let regionSwitch = testMap.mapFeatures.edits.regionSwitch;
      let regionNameColor = testMap.mapFeatures.edits.regionNameColor;
      let backgroundColor = testMap.mapFeatures.edits.backgroundColor;
      let center = testMap.mapFeatures.edits.center;
      let zoom = testMap.mapFeatures.edits.zoom;

    let updatedAttributes = {
      mapColor,
      borderSwitch,
      borderWidth,
      borderColor,
      regionSwitch,
      regionNameColor,
      backgroundColor,
      center,
      zoom,
    };
    for (const key in updatedAttributes) {
      if (Object.prototype.hasOwnProperty.call(updatedAttributes, key)) {
        testMap.mapFeatures.edits[key] = updatedAttributes[key];
      }
    }


    const response4 = await request(app).put('/api/updateMapFeatures/' + response3.body.map._id).set('Cookie', response2.headers['set-cookie']).send(testMap.mapFeatures);
    expect(response4.statusCode).toBe(500);
  });
  test('should fail to update map (bad features) attributes by id for Put request to /api/updateMapFeatures/:id WRITE TEST', async () => {
      
      const response1 = await request(app).post('/auth/register').send(accountToAdd);
      expect(response1.statusCode).toBe(201);
  
      response2 = await request(app).post('/auth/login').send(accountToLogin);
      expect(response2.statusCode).toBe(200);
  
      const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
      expect(response3.statusCode).toBe(201);

      let features = testMap.mapFeatures;
      features.edits.mapColor = "blue";
      features.edits.borderSwitch = true;

  
      const response4 = await request(app).put('/api/updateMapFeatures/' + response3.body.map._id).set('Cookie', response2.headers['set-cookie']).send(features);
      expect(response4.statusCode).toBe(500);
  });

  test('should fail to update map (bad user) attributes by id for Put request to /api/updateMapFeatures/:id WRITE TEST', async () => {
      
    const response1 = await request(app).post('/auth/register').send(accountToAdd);
    expect(response1.statusCode).toBe(201);

    response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(200);

    //Change email on map
    testMap.ownerEmail = "wrong@gmail.com";
    const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
    testMap.ownerEmail= 'john@gmail.com';
    expect(response3.statusCode).toBe(201);

    let features = testMap.mapFeatures;
    features.edits.mapColor = "blue";
    features.edits.borderSwitch = true;


    const response4 = await request(app).put('/api/updateMapFeatures/' + response3.body.map._id).set('Cookie', response2.headers['set-cookie']).send(features);
    expect(response4.statusCode).toBe(404);
});

test('should fail to update map (missing map id) attributes by id for Put request to /api/updateMapFeatures/:id WRITE TEST', async () => {
      
  const response1 = await request(app).post('/auth/register').send(accountToAdd);
  expect(response1.statusCode).toBe(201);

  response2 = await request(app).post('/auth/login').send(accountToLogin);
  expect(response2.statusCode).toBe(200);

  const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
  expect(response3.statusCode).toBe(201);

  let features = testMap.mapFeatures;
  features.edits.mapColor = "blue";
  features.edits.borderSwitch = true;

  //Missing Id
  const response4 = await request(app).put('/api/updateMapFeatures/').set('Cookie', response2.headers['set-cookie']).send(features);
  expect(response4.statusCode).toBe(404);
});

test('should fail to update map (missing map id) attributes by id for Put request to /api/updateMapFeatures/:id WRITE TEST', async () => {
      
  const response1 = await request(app).post('/auth/register').send(accountToAdd);
  expect(response1.statusCode).toBe(201);

  response2 = await request(app).post('/auth/login').send(accountToLogin);
  expect(response2.statusCode).toBe(200);

  const response3 = await request(app).post('/api/createNewMap').set('Cookie', response2.headers['set-cookie']).send(testMap);
  expect(response3.statusCode).toBe(201);

  let features = testMap.mapFeatures;
  features.edits.mapColor = "blue";
  features.edits.borderSwitch = true;

  //Messed up id
  const response4 = await request(app).put('/api/updateMapFeatures/'+ response3.body.map._id + '1').set('Cookie', response2.headers['set-cookie']).send(features);
  expect(response4.statusCode).toBe(500);
});
  });