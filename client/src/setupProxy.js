// client/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // All requests starting with /api will be proxied
    createProxyMiddleware({
      target: 'http://localhost:5000', // Your backend server URL
      changeOrigin: true, // Needed for virtual hosted sites
    })
  );
};
