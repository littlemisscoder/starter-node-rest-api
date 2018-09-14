const User = require('../../data/User');
const TokenService = require('../../services/tokenService');
const messages = require('../commonMessages');

async function getUser(req, res) {
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
              data: user,
              message: messages.success,
            });
          }
        })
        .catch((err) => {
          res.status(500).json({
            message: messages.getUserMongoError(err),
            data: null,
          });
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
  getUser,
};
