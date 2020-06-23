const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');

require('./database/mongoose');

const userRoute = require('./routes/user');
const taskRoute = require('./routes/task');

const app = express();

const options = {
  definition: {
    openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: 'Hello World', // Title (required)
      version: '1.0.0', // Version (required)
    },
  },
  // Path to the API docs
  apis: ['./routes.js'],
};
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

module.exports = app;
