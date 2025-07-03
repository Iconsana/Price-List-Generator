const express = require('express');
const { createRequestHandler } = require('@remix-run/express');

const app = express();
app.use(express.static('public'));

app.all('*', createRequestHandler({
  build: require('./build'),
  mode: process.env.NODE_ENV
}));

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Server ready at http://${host}:${port}`);
});