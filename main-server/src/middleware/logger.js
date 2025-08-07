const util = require('util');

const loggerMiddleware = (req, res, next) => {
  const startTime = process.hrtime();

  // Save original res.send to intercept
  const originalSend = res.send;

  let responseBody;

  res.send = function (body) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const duration = process.hrtime(startTime);
    const durationMs = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2);

    console.log(`📩 [${req.method}] ${req.originalUrl}`);
    console.log(`🔸 Headers: ${JSON.stringify(req.headers, null, 2)}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`🔸 Body: ${util.inspect(req.body, { depth: 2 })}`);
    }

    console.log(`✅ Response: ${res.statusCode} (${durationMs} ms)`);
    if (typeof responseBody === 'object') {
      console.log(`🔸 Response Body: ${util.inspect(responseBody, { depth: 2 })}`);
    } else {
      console.log(`🔸 Response Body: ${responseBody}`);
    }

    console.log('----------------------------------------');
  });

  next();
};

module.exports = loggerMiddleware;
