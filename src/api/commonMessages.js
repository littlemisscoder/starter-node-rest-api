module.exports = {
  internalServerError:
    'Error: An error occurred while processing your request, check your connection or try again later.',
  tokenAuthenticationError: 'Error: Failed to authenticate token.',
  userNotFoundError: 'Error: Unable to find user.',
  getUserMongoError: err => `Error trying to get user: ${err}`,
  saveUserMongoError: err => `Error trying to save user: ${err}`,
  missingUsernameOrPasswordError:
    'Error: Missing required fields for username and/or password',
  passwordLengthError: 'Error: Password length must be at least 8 characters',
  unauthorizedLoginError: 'Unauthorized: Invalid username/password.',
  duplicateUserError: 'Error: username already exists',
  success: 'Success',
};
