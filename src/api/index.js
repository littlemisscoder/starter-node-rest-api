const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    data: null,
    message: 'Success',
  });
});

// inject queries
const userQueries = require('./user/userQueries');
const authQueries = require('./auth/authQueries');

// route queries
router.get('/api/user', userQueries.getUser);
router.post('/api/verifyToken', authQueries.verifyToken);
router.post('/api/login', authQueries.loginUser);
router.post('/api/register', authQueries.registerUser);

module.exports = router;
