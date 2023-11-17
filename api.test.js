const request = require('supertest');
const app = require('./index.js');
const db = require('./databasetemp.js');

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