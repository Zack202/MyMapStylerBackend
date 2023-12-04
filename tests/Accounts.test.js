const request = require('supertest');
const app = require('../index.js');
const db = require('../databasetemp.js');

const agent = request.agent(app);

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Create New Account Tests', () => {

    test('should create a new account for a Post request to /api/register WRITE TEST', async () => {
        const accountToAdd = {
            firstName: 'john',
            lastName: 'doe',
            userName: 'johndoe',
            email: 'john@gmail.com',
            password: 'password',
            confirmPassword: 'password'};

        const response = await request(app).post('/auth/register').send(accountToAdd);
        expect(response.statusCode).toBe(201);
        expect(response.body.user.userName).toBe(accountToAdd.userName);
        expect(response.body.user.firstName).toBe(accountToAdd.firstName);
        expect(response.body.user.lastName).toBe(accountToAdd.lastName);
        expect(response.body.user.email).toBe(accountToAdd.email);
        expect(response.body.success).toBe(true);
        });

        test('should fail to create a new account (all feilds not entered) for a Post request to /api/register WRITE TEST', async () => {
          const accountToAdd = {
              firstName: 'john',
              lastName: 'doe',
              email: 'john@gmail.com',
              password: 'password'
            };
  
          const response = await request(app).post('/auth/register').send(accountToAdd);
          expect(response.statusCode).toBe(400);
          expect(response.body.errorMessage).toBe("Please enter all required fields.");
          });

        test('should fail to create a new account (password not long enough) for a Post request to /api/register WRITE TEST', async () => {
          const accountToAdd = {
            firstName: 'john',
            lastName: 'doe',
            userName: 'johndoe',
            email: 'john@gmail.com',
            password: 'pass',
            confirmPassword: 'pass'};
  
          const response = await request(app).post('/auth/register').send(accountToAdd);
          expect(response.statusCode).toBe(400);
          expect(response.body.errorMessage).toBe("Please enter a password of at least 8 characters.");
          });

        test('should fail to create a new account (password and verify password dont match) for a Post request to /api/register WRITE TEST', async () => {
          const accountToAdd = {
            firstName: 'john',
            lastName: 'doe',
            userName: 'johndoe',
            email: 'john@gmail.com',
            password: 'password123',
            confirmPassword: 'password124'};
  
          const response = await request(app).post('/auth/register').send(accountToAdd);
          expect(response.statusCode).toBe(400);
          expect(response.body.errorMessage).toBe("Please enter the same password twice.");
          });

        test('should fail to create a new account (email in use) for a Post request to /api/register WRITE TEST', async () => {
          const accountToAdd1 = {
            firstName: 'john',
            lastName: 'doe',
            userName: 'johndoe',
            email: 'john@gmail.com',
            password: 'password',
            confirmPassword: 'password'};

          const response1 = await request(app).post('/auth/register').send(accountToAdd1);
          expect(response1.statusCode).toBe(201);
          expect(response1.body.success).toBe(true);

          //Account with email john@gmail already exists
          
          const accountToAdd2 = {
            firstName: 'john2',
            lastName: 'doe2',
            userName: 'johndoe2',
            email: 'john@gmail.com',
            password: 'password2',
            confirmPassword: 'password2'};
  
          const response2 = await request(app).post('/auth/register').send(accountToAdd2);
          expect(response2.statusCode).toBe(400);
          expect(response2.body.success).toBe(false);
          expect(response2.body.errorMessage).toBe("An account with this email address already exists.");
          });

        test('should fail to create a new account (user name exists) for a Post request to /api/register WRITE TEST', async () => {
          const accountToAdd1 = {
            firstName: 'john',
            lastName: 'doe',
            userName: 'johndoe',
            email: 'john@gmail.com',
            password: 'password',
            confirmPassword: 'password'};

          const response1 = await request(app).post('/auth/register').send(accountToAdd1);
          expect(response1.statusCode).toBe(201);
          expect(response1.body.success).toBe(true);

          //Account with userName already already exists
          
          const accountToAdd2 = {
            firstName: 'john2',
            lastName: 'doe2',
            userName: 'johndoe',
            email: 'john2@gmail.com',
            password: 'password2',
            confirmPassword: 'password2'};
  
          const response2 = await request(app).post('/auth/register').send(accountToAdd2);
          expect(response2.statusCode).toBe(400);
          expect(response2.body.success).toBe(false);
          expect(response2.body.errorMessage).toBe("An account with this user name already exists.");
          });
  });

describe('Login Tests', () => {

  test('should login for a Get request to /auth/login READ TEST', async () => {
    const accountToAdd = {
      firstName: 'john',
      lastName: 'doe',
      userName: 'johndoe',
      email: 'john@gmail.com',
      password: 'password',
      confirmPassword: 'password'};

  const response1 = await request(app).post('/auth/register').send(accountToAdd);
  expect(response1.statusCode).toBe(201);

    const accountToLogin = {
      email: 'john@gmail.com',
      password: 'password'
    }
    const response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(200);
    expect(response2.body.success).toBe(true);
    expect(response2.body.user.email).toBe(accountToLogin.email);
  });

  test('should not login (missing fields) for a Get request to /auth/login READ TEST', async () => {
    const accountToAdd = {
      firstName: 'john',
      lastName: 'doe',
      userName: 'johndoe',
      email: 'john@gmail.com',
      password: 'password',
      confirmPassword: 'password'};

  const response1 = await request(app).post('/auth/register').send(accountToAdd);
  expect(response1.statusCode).toBe(201);

    const accountToLogin = {
      email: 'john@gmail.com'
    }
    const response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(400);
    expect(response2.body.errorMessage).toBe("Please enter all required fields.");
  });

  test('should not login (wrong combo) for a Get request to /auth/login READ TEST', async () => {
    const accountToAdd = {
      firstName: 'john',
      lastName: 'doe',
      userName: 'johndoe',
      email: 'john@gmail.com',
      password: 'password',
      confirmPassword: 'password'};

  const response1 = await request(app).post('/auth/register').send(accountToAdd);
  expect(response1.statusCode).toBe(201);

    const accountToLogin = {
      email: 'john@gmail.com',
      password: 'password123'
    }
    const response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(401);
    expect(response2.body.errorMessage).toBe("Wrong email or password provided.");
    
  });
});

describe('Logout Tests', () => {
      
      test('should logout for a Get request to /auth/logout READ TEST', async () => {
        
        const response = await request(app).get('/auth/logout');
        expect(response.statusCode).toBe(200);
        //Check cookie is cleared
        expect(response.headers['set-cookie'][0]).toBe("token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None");
      });


  describe('Get Logged In Tests', () => {
      
    test('should check if user is logged in for a Get request to /auth/loggedIn READ TEST', async () => {
      const accountToAdd = {
        firstName: 'john',
        lastName: 'doe',
        userName: 'johndoe',
        email: 'john@gmail.com',
        password: 'password',
        confirmPassword: 'password'};
  
    const response1 = await request(app).post('/auth/register').send(accountToAdd);
    expect(response1.statusCode).toBe(201);
  
    const accountToLogin = {
      email: 'john@gmail.com',
      password: 'password'
    }
    const response2 = await request(app).post('/auth/login').send(accountToLogin);
    expect(response2.statusCode).toBe(200);

    const cookies = response2.header['set-cookie'];

    const response3 = await request(app).get('/auth/loggedIn').set('Cookie', cookies).send();
    expect(response3.body.loggedIn).toBe(true);
    });

    test('should check and fail (different users or not logged in) if user is logged in for a Get request to /auth/loggedIn READ TEST', async () => {
      const response = await request(app).get('/auth/loggedIn').send();
  
      expect(response.statusCode).toBe(401);
      expect(response.body.loggedIn).toBe(false);
    });
});
});


describe('ForgotPassword Tests', () => {
    test('should not send email (user not found) for a Post request to /auth/forgotPassword WRITE TEST', async () => {
      const emailToSend = {
        email: 'john@gmail.com'
      }

      const response1 = await request(app).post('/auth/forgotPassword').send(emailToSend);
      expect(response1.statusCode).toBe(400);
      expect(response1.body.errorMessage).toBe("An account with this email address does not exist.");

    });
    test('should not send email (no email) for a Post request to /auth/forgotPassword WRITE TEST', async () => {

      const response1 = await request(app).post('/auth/forgotPassword').send();
      expect(response1.statusCode).toBe(400);
      expect(response1.body.errorMessage).toBe("Please enter all required fields.");

    });

    test('should not send email (no email) for a Post request to /auth/forgotPassword WRITE TEST', async () => {
      const accountToAdd = {
        firstName: 'john',
        lastName: 'doe',
        userName: 'johndoe',
        email: 'john@gmail.com',
        password: 'password',
        confirmPassword: 'password'};
  
      const response1 = await request(app).post('/auth/register').send(accountToAdd);
      expect(response1.statusCode).toBe(201);

      const emailToSend = {
        email: 'john@gmail.com'
      }
      const response2 = await request(app).post('/auth/forgotPassword').send(emailToSend);
      expect(response2.statusCode).toBe(200);
      expect(response2.body.success).toBe(true);
    });
  });

  describe('ResetPassword Tests', () => {
    test('should not reset password (no email) for a Patch request to /auth/resetPassword WRITE TEST', async () => {
      
      const response = await request(app).patch('/auth/resetPassword/fake').send();
      expect(response.statusCode).toBe(400);
      expect(response.body.errorMessage).toBe("Token is invalid or has expired.");
    });
  });

  describe('Delete User Tests', () => {
    test('should delete User for a Get request to /auth/deleteUser WRITE TEST', async () => {
      accountToAdd = {
        firstName: 'john',
        lastName: 'doe',
        userName: 'johndoe',
        email: 'john@gmail.com',
        password: 'password',
        confirmPassword: 'password'};

      const response1 = await request(app).post('/auth/register').send(accountToAdd);
      expect(response1.statusCode).toBe(201);

      const accountToLogin = {
        email: 'john@gmail.com',
        password: 'password'
      }

      const response2 = await request(app).post('/auth/login').send(accountToLogin);
      expect(response2.statusCode).toBe(200);

      const cookies = response2.header['set-cookie'];

      const response3 = await request(app).get('/auth/deleteUser').set('Cookie', cookies).send();
      expect(response3.statusCode).toBe(200);
      expect(response3.body.success).toBe(true);
      
    });

    test('should fail to delete (no user) User for a Get request to /auth/deleteUser WRITE TEST', async () => {

      const response3 = await request(app).get('/auth/deleteUser').send();
      expect(response3.statusCode).toBe(401);
      
    });
  });

