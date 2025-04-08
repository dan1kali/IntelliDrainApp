const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};


/* const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy WebSocket connections
  app.use(
    '/socket.io',
    proxy({
      target: 'http://localhost:5000',
      ws: true, // Enable WebSocket support
    })
  );

  // Proxy regular API requests
  app.use(
    '/api',
    proxy({
      target: 'http://localhost:5000',
      changeOrigin: true, // For handling CORS issues
    })
  );
}; */
