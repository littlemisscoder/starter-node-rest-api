const bcrypt = require('bcryptjs');
const mockingoose = require('mockingoose').default;
const mongoose = require('mongoose');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const User = require('../../data/User'); // eslint-disable-line no-unused-vars
const authQueries = require('./authQueries');
const TokenService = require('../../services/tokenService');

describe('authQueries ', () => {
  describe('verifyToken ', () => {
    let sandbox;
    let userId;
    let username;
    let error;
    let user;
    let token;
    let request;
    let response;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      userId = mongoose.Types.ObjectId().toHexString();
      username = 'username';
      error = new Error();
      user = { _id: userId, username };
      token = 'token';
      request = httpMocks.createRequest({
        headers: {
          'x-access-token': token,
        },
      });
      response = httpMocks.createResponse();
    });

    afterEach(() => {
      sandbox.restore();
      mockingoose.User.reset();
    });

    it('should return 200', async () => {
      // Given
      const expectedResult = {
        data: {
          id: userId,
          username,
        },
        message: 'Success',
      };
      mockingoose.User.toReturn(user, 'findOne');
      sandbox.stub(TokenService, 'decodeAuthHeader').returns(userId);

      // When
      await authQueries.verifyToken(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(200);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when decodeAuthHeader returns null', async () => {
      // Given
      const expectedResult = {
        data: null,
        message: 'Error: Failed to authenticate token.',
      };
      sandbox.stub(TokenService, 'decodeAuthHeader').returns(null);

      // When
      await authQueries.verifyToken(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(401);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when decodeAuthHeader throws error', async () => {
      // Given
      const expectedResult = {
        data: null,
        message:
          'Error: An error occurred while processing your request, check your connection or try again later.',
      };
      sandbox.stub(TokenService, 'decodeAuthHeader').throws(error);

      // When
      await authQueries.verifyToken(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when User returns null', async () => {
      // Given
      const expectedResult = {
        data: null,
        message: 'Error: Unable to find user.',
      };
      mockingoose.User.toReturn(null, 'findOne');
      sandbox.stub(TokenService, 'decodeAuthHeader').returns(userId);

      // When
      await authQueries.verifyToken(request, response);

      // Then
      const responseData = JSON.parse(await response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when User throws error', async () => {
      // Given
      const expectedResult = {
        data: null,
        message: `Error trying to get user: ${error}`,
      };
      mockingoose.User.toReturn(error, 'findOne');
      sandbox.stub(TokenService, 'decodeAuthHeader').returns(userId);

      // When
      await authQueries.verifyToken(request, response);

      // Then
      const responseData = JSON.parse(await response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when request is null', async () => {
      // Given
      request = null;
      const expectedResult = {
        data: null,
        message:
          'Error: An error occurred while processing your request, check your connection or try again later.',
      };

      // When
      await authQueries.verifyToken(request, response);

      // Then
      const responseData = JSON.parse(await response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });
  });

  describe('loginUser ', () => {
    let sandbox;
    let userId;
    let username;
    let password;
    let hashedPassword;
    let error;
    let user;
    let token;
    let authCredentials;
    let request;
    let response;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      userId = mongoose.Types.ObjectId().toHexString();
      username = 'username';
      password = 'password';
      error = new Error();
      hashedPassword = bcrypt.hashSync(password, 8);
      user = { _id: userId, username, password: hashedPassword };
      token = 'token';
      authCredentials = {
        username,
        password,
      };
      request = httpMocks.createRequest({
        headers: {
          'x-access-token': token,
        },
        body: authCredentials,
      });
      response = httpMocks.createResponse();
    });

    afterEach(() => {
      sandbox.restore();
      mockingoose.User.reset();
    });

    it('should return 200', async () => {
      // Given
      const expectedResult = {
        data: {
          token,
          username,
        },
        message: 'Success',
      };
      mockingoose.User.toReturn(user, 'findOne');
      sandbox.stub(TokenService, 'encodeTokenWithId').returns(token);

      // When
      await authQueries.loginUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(200);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when username is null', async () => {
      // Given
      authCredentials.username = null;
      const expectedResult = {
        data: null,
        message: 'Error: Missing required fields for username and/or password',
      };

      // When
      await authQueries.loginUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when password is null', async () => {
      // Given
      authCredentials.password = null;
      const expectedResult = {
        data: null,
        message: 'Error: Missing required fields for username and/or password',
      };

      // When
      await authQueries.loginUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when password is less than 8 characters', async () => {
      // Given
      authCredentials.password = '';
      const expectedResult = {
        data: null,
        message: 'Error: Password length must be at least 8 characters',
      };

      // When
      await authQueries.loginUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when encodeTokenWithId throws error', async () => {
      // Given
      const expectedResult = {
        data: null,
        message: `Error trying to get user: ${error}`,
      };
      mockingoose.User.toReturn(user, 'findOne');
      sandbox.stub(TokenService, 'encodeTokenWithId').throws(error);

      // When
      await authQueries.loginUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 401 when password is invalid', async () => {
      // Given
      authCredentials.password = 'invalidPassword';
      const expectedResult = {
        message: 'Unauthorized: Invalid username/password.',
        data: null,
      };
      mockingoose.User.toReturn(user, 'findOne');
      sandbox.stub(TokenService, 'encodeTokenWithId').returns(token);

      // When
      await authQueries.loginUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(401);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when User returns null', async () => {
      // Given
      const expectedResult = {
        data: null,
        message: 'Error: Unable to find user.',
      };
      mockingoose.User.toReturn(null, 'findOne');
      sandbox.stub(TokenService, 'encodeTokenWithId').returns(token);

      // When
      await authQueries.loginUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when User throws an error', async () => {
      // Given
      const expectedResult = {
        data: null,
        message: `Error trying to get user: ${error}`,
      };
      mockingoose.User.toReturn(error, 'findOne');
      sandbox.stub(TokenService, 'encodeTokenWithId').returns(token);

      // When
      await authQueries.loginUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when request is null', async () => {
      // Given
      const expectedResult = {
        data: null,
        message:
          'Error: An error occurred while processing your request, check your connection or try again later.',
      };
      // When
      await authQueries.loginUser(null, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });
  });

  describe('registerUser', () => {
    let sandbox;
    let userId;
    let username;
    let password;
    let hashedPassword;
    let error;
    let user;
    let token;
    let authCredentials;
    let request;
    let response;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      userId = mongoose.Types.ObjectId().toHexString();
      username = 'username';
      password = 'password';
      error = new Error();
      hashedPassword = bcrypt.hashSync(password, 8);
      user = { _id: userId, username, password: hashedPassword };
      token = 'token';
      authCredentials = {
        username,
        password,
      };
      request = httpMocks.createRequest({
        headers: {
          'x-access-token': token,
        },
        body: authCredentials,
      });
      response = httpMocks.createResponse();
    });

    afterEach(() => {
      sandbox.restore();
      mockingoose.User.reset();
    });

    it('should return 200', async () => {
      // Given
      const expectedResult = {
        data: {
          token,
          username,
        },
        message: 'Success',
      };
      mockingoose.User.toReturn(user, 'save');
      sandbox.stub(TokenService, 'encodeTokenWithId').returns(token);

      // When
      await authQueries.registerUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(200);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when username is null', async () => {
      // Given
      authCredentials.username = null;
      const expectedResult = {
        data: null,
        message: 'Error: Missing required fields for username and/or password',
      };

      // When
      await authQueries.registerUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when password is null', async () => {
      // Given
      authCredentials.password = null;
      const expectedResult = {
        data: null,
        message: 'Error: Missing required fields for username and/or password',
      };

      // When
      await authQueries.registerUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 400 when password is less than 8 characters', async () => {
      // Given
      authCredentials.password = '';
      const expectedResult = {
        data: null,
        message: 'Error: Password length must be at least 8 characters',
      };

      // When
      await authQueries.registerUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when encodeTokenWithId throws error', async () => {
      // Given
      const expectedResult = {
        data: null,
        message: `Error trying to save user: ${error}`,
      };
      mockingoose.User.toReturn(user, 'save');
      sandbox.stub(TokenService, 'encodeTokenWithId').throws(error);

      // When
      await authQueries.registerUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when User throws duplicate field error', async () => {
      // Given
      error = new Error();
      error.errmsg = 'E11000';
      const expectedResult = {
        data: null,
        message: 'Error: username already exists',
      };
      mockingoose.User.toReturn(error, 'save');

      // When
      await authQueries.registerUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(400);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when request is null', async () => {
      // Given
      const expectedResult = {
        data: null,
        message:
          'Error: An error occurred while processing your request, check your connection or try again later.',
      };
      // When
      await authQueries.registerUser(null, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });
  });
});
