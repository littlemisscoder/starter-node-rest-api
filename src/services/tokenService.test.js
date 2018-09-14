const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const TokenService = require('./tokenService');
const delay = require('delay');

describe('tokenService', () => {
  describe('decodeAuthHeader ', () => {
    const secret = 'secret';
    const headerName = 'x-access-token';
    let id;
    let token;
    let request;

    beforeAll(() => {
      process.env = {
        TOKEN_SECRET: secret,
      };
    });

    beforeEach(() => {
      id = 'id';
      token = jwt.sign({ id }, secret);
      request = {
        headers: {
          'x-access-token': token,
        },
      };
    });

    it('returns id from valid token', () => {
      // When
      const result = TokenService.decodeAuthHeader(request);

      // Then
      expect(result).toBe(id);
    });

    it('returns null from null token', () => {
      // Given
      request.headers[headerName] = undefined;

      // When
      const result = TokenService.decodeAuthHeader(request);

      // Then
      expect(result).toBe(null);
    });

    it('returns null from invalid token', () => {
      // Given
      token = jwt.sign({ id }, 'invalidSecret');
      request.headers[headerName] = token;

      // When
      const result = TokenService.decodeAuthHeader(request);

      // Then
      expect(result).toBe(null);
    });

    it('returns null from expired token', async () => {
      // Given
      token = jwt.sign({ id }, secret, { expiresIn: 1 });
      request.headers[headerName] = token;

      // When
      await delay(1000);
      const result = TokenService.decodeAuthHeader(request);

      // Then
      expect(result).toBe(null);
    });
  });

  describe('encodeTokenWithId ', () => {
    const secret = 'secret';
    let id;

    beforeAll(() => {
      process.env = {
        TOKEN_SECRET: secret,
      };
    });

    beforeEach(() => {
      id = 'id';
    });

    it('returns jwt token', () => {
      // Given
      const expectedPayload = { id };
      const expectedOptions = {
        expiresIn: 86400,
      };
      const jwtSignSpy = sinon.spy(jwt, 'sign');

      // When
      const result = TokenService.encodeTokenWithId(id);

      // Then
      const payload = jwtSignSpy.args[0][0];
      const secretOrPrivateKey = jwtSignSpy.args[0][1];
      const options = jwtSignSpy.args[0][2];
      expect(typeof result).toBe('string');
      expect(jwtSignSpy.calledOnce).toBeTruthy();
      expect(payload).toEqual(expectedPayload);
      expect(secretOrPrivateKey).toEqual(secret);
      expect(options).toEqual(expectedOptions);
    });
  });
});
