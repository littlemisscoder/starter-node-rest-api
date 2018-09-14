const bcrypt = require('bcryptjs');

const User = require('../../data/User');
const TokenService = require('../../services/tokenService');
const messages = require('../commonMessages');

const idField = '_id';
const usernameField = 'username';

function isRequiredFieldsExists(req) {
  const username = req.body == null ? null : req.body.username;
  const password = req.body == null ? null : req.body.password;
  return username != null && password != null;
}

function isPasswordLengthValid(req) {
  return req.body.password.length >= 8;
}

function isDuplicateMongoError(err) {
  return err != null && err.errmsg != null && err.errmsg.indexOf('E11000') >= 0;
}

async function verifyToken(req, res) {
  try {
    const userId = TokenService.decodeAuthHeader(req);
    if (userId == null) {
      res.status(401).json({
        data: null,
        message: messages.tokenAuthenticationError,
      });
    } else {
      await User.findOne({ _id: userId })
        .lean()
        .then((user) => {
          if (!user) {
            res.status(400).json({
              message: messages.userNotFoundError,
              data: null,
            });
          } else {
            res.status(200).json({
              message: messages.success,
              data: {
                id: user[idField],
                username: user[usernameField],
              },
            });
          }
        })
        .catch((userErr) => {
          if (userErr) {
            res.status(500).json({
              message: messages.getUserMongoError(userErr),
              data: null,
            });
          }
        });
    }
  } catch (err) {
    res.status(500).json({
      message: messages.internalServerError,
      data: null,
    });
  }
}

async function loginUser(req, res) {
  try {
    if (!isRequiredFieldsExists(req)) {
      res.status(400).json({
        data: null,
        message: messages.missingUsernameOrPasswordError,
      });
    } else if (!isPasswordLengthValid(req)) {
      res.status(400).json({
        data: null,
        message: messages.passwordLengthError,
      });
    } else {
      const { username, password } = req.body;
      await User.findOne({ username })
        .lean()
        .then((user) => {
          if (!user) {
            res.status(400).json({
              message: messages.userNotFoundError,
              data: null,
            });
          } else {
            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (passwordIsValid) {
              const token = TokenService.encodeTokenWithId(user[idField]);
              res.status(200).json({
                message: messages.success,
                data: {
                  token,
                  username: user[usernameField],
                },
              });
            } else {
              res.status(401).json({
                message: messages.unauthorizedLoginError,
                data: null,
              });
            }
          }
        })
        .catch((err) => {
          if (err) {
            res.status(500).json({
              message: messages.getUserMongoError(err),
              data: null,
            });
          }
        });
    }
  } catch (err) {
    res.status(500).json({
      message: messages.internalServerError,
      data: null,
    });
  }
}

async function registerUser(req, res) {
  try {
    if (!isRequiredFieldsExists(req)) {
      res.status(400).json({
        data: null,
        message: messages.missingUsernameOrPasswordError,
      });
    } else if (!isPasswordLengthValid(req)) {
      res.status(400).json({
        data: null,
        message: messages.passwordLengthError,
      });
    } else {
      const { username, password } = req.body;
      const hashedPassword = bcrypt.hashSync(password, 8);
      const newUser = new User({
        username,
        password: hashedPassword,
      });
      await newUser
        .save()
        .then((user) => {
          const token = TokenService.encodeTokenWithId(user[idField]);
          const result = {
            token,
            username,
          };
          res.status(200).json({
            message: messages.success,
            data: result,
          });
        })
        .catch((err) => {
          if (isDuplicateMongoError(err)) {
            res.status(400).json({
              message: messages.duplicateUserError,
              data: null,
            });
          } else {
            res.status(500).json({
              message: messages.saveUserMongoError(err),
              data: null,
            });
          }
        });
    }
  } catch (err) {
    res.status(500).json({
      message: messages.internalServerError,
      data: null,
    });
  }
}

// Exports
module.exports = {
  verifyToken,
  loginUser,
  registerUser,
};
