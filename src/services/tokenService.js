const jwt = require('jsonwebtoken');

// Takes in the request, and returns the userId, if decoded correctly.
function decodeAuthHeader(req) {
  const token = req.headers['x-access-token'];
  if (!token) {
    return null;
  }
  return jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return null;
    }

    // null check not necessary, decoded will be undefined if there is an err thrown.
    return decoded.id;
  });
}

function encodeTokenWithId(id) {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: 86400, // expires in 24 hours
  });
}

// Exports
module.exports = {
  decodeAuthHeader,
  encodeTokenWithId,
};
