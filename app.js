const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('./database/mongoose');

const userRoute = require('./routes/user');
const taskRoute = require('./routes/task');

const app = express();

const options = {
  definition: {
    openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: 'Task API', // Title (required)
      version: '1.0.0', // Version (required)
    },
  },
  // Path to the API docs
  apis: ['./routes/*js'],
};
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);

// app.get('/docs', (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.send(swaggerSpec);
// });

app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(
  swaggerSpec, {
    explorer: true,
  },
));

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

module.exports = app;
