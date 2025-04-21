const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:9222',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // 移除/api前缀
      },
    })
  );
};