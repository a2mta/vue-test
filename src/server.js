const express = require('express');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const configs = require('../webpack.config.js');
const yamljs = require('yamljs');
const resolveRefs = require('json-refs').resolveRefs;

const clientsMongo = require('./database/clients/routes');
const providersMongo = require('./database/providers/routes');
const devServerEnabled = process.env.NODE_ENV === 'development';
const clientConfig = configs.filter(({ name }) => name === 'client')[0];


const multiFileSwagger = (root) => {
  const options = {
    filter: ['relative', 'remote'],
    loaderOptions: {
      processContent: function (res, callback) {
        callback(null, yamljs.parse(res.text));
      },
    },
  };

  return resolveRefs(root, options).then(
    function (results) {
      return results.resolved;
    },
    function (err) {
      console.log(err.stack);
    }
  );
};

const app = express();

multiFileSwagger(yamljs.load(path.resolve(__dirname, './docs/v1.yaml'))).then(
  (swaggerDoc) =>
    app.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
);

if (devServerEnabled) {
  clientConfig.entry.main.unshift(
    'webpack-hot-middleware/client?reload=true&timeout=1000&mode=development'
  );
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  const compiler = webpack(clientConfig);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: clientConfig.output.publicPath,
    })
  );
  app.use(webpackHotMiddleware(compiler));
}

mongoose.connect('mongodb://localhost:27017/vue-test');

app.use(express.static('dist'));
app.use(express.json());

app.use('/api/clients', clientsMongo);
app.use('/api/providers', providersMongo);

app.listen(8080, () => {
  console.log('App is running...');
});
