const mockingoose = require('mockingoose').default;
const mongoose = require('mongoose');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const User = require('../../data/User'); // eslint-disable-line no-unused-vars
const userQueries = require('./userQueries');
const TokenService = require('../../services/tokenService');

describe('userQueries ', () => {
  describe('getUser ', () => {
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
        data: user,
        message: 'Success',
      };
      mockingoose.User.toReturn(user, 'findOne');
      sandbox.stub(TokenService, 'decodeAuthHeader').returns(userId);

      // When
      await userQueries.getUser(request, response);

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
      await userQueries.getUser(request, response);

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
      await userQueries.getUser(request, response);

      // Then
      const responseData = JSON.parse(response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });

    it('should return 500 when User returns null', async () => {
      // Given
      const expectedResult = {
        data: null,
        message: 'Error: Unable to find user.',
      };
      mockingoose.User.toReturn(null, 'findOne');
      sandbox.stub(TokenService, 'decodeAuthHeader').returns(userId);

      // When
      await userQueries.getUser(request, response);

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
      await userQueries.getUser(request, response);

      // Then
      const responseData = JSON.parse(await response._getData()); // eslint-disable-line no-underscore-dangle
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
      await userQueries.getUser(null, response);

      // Then
      const responseData = JSON.parse(await response._getData()); // eslint-disable-line no-underscore-dangle
      expect(response.statusCode).toBe(500);
      expect(responseData).toMatchObject(expectedResult);
    });
  });
});
