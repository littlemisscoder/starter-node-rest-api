// External dependencies
const dotenv = require('dotenv');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Internal dependencies
const api = require('./src/api/index');
const config = require('./src/config/db');

// Initialize express app
const app = express();

// Configure env variables from .env file
dotenv.config();

// Initalize logging
app.use(logger(app.get('env') === 'production' ? 'combined' : 'dev'));

// Parse application/json
app.use(bodyParser.json());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize db
mongoose
  .connect(
    config.db,
    { useNewUrlParser: true },
  )
  .then(
    () => {
      console.log('Database is connected'); /* eslint-disable-line no-console */
    },
    (err) => {
      console.log(`Can not connect to the database: ${err}`); /* eslint-disable-line no-console */
    },
  );

// CORS
// This allows client applications from other domains use the API Server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-access-token',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Initialize routes
app.use('/', api);

// Server Setup
app.set('env', process.env.NODE_ENV || 'development');
app.set('host', process.env.HOST || '0.0.0.0');
app.set('port', process.env.PORT || 3001);

app.listen(app.get('port'), () => {
  console.log(`REST API listening on ${app.get('host')}/${app.get('port')}`); /* eslint-disable-line no-console */
});

// Error Handlers
// Catch 404
app.use((req, res) => {
  console.log('Not Found');
  res.status(404).json({
    message: 'Not Found',
  });
});

module.exports = app;
