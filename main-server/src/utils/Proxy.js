const actualProxy = async (req, res) => {
  try {
    console.log('Incoming request:', req.method, req.originalUrl);
    
    // Path rewriting logic
    const rem = req.originalUrl.replace('/api/workspace/', '');
    const Workspace_ID=rem.split('/')[0]
    console.log('Workspace ID:', rem.split('/')[0]);
    const after=rem.replace(Workspace_ID,'')
    const baseUrl = `http://runtime-${Workspace_ID}:3000`;
    const targetUrl = baseUrl + after;
    console.log('Target URL:', targetUrl);
    
    // Prepare headers for forwarding
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders.host; // Remove original host
    delete forwardHeaders.connection; // Remove connection-specific headers
    delete forwardHeaders['content-length']; // Let fetch handle this
    
    // Prepare fetch options based on HTTP method
    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
      timeout: 30000, // 30 second timeout
    };
    
    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
      // Handle different content types
      if (req.headers['content-type']?.includes('application/json')) {
        fetchOptions.body = JSON.stringify(req.body);
      } else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        fetchOptions.body = new URLSearchParams(req.body).toString();
      } else {
        // For raw data, files, etc.
        fetchOptions.body = req.body;
      }
    }
    
    // Make the proxied request
    const response = await fetch(targetUrl, fetchOptions);
    
    // Forward response status
    res.status(response.status);
    
    // Forward response headers (excluding connection-specific ones)
    for (const [key, value] of response.headers.entries()) {
      if (!['connection', 'transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        res.set(key, value);
      }
    }
    
    // Handle response based on content type
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const jsonResponse = await response.json();
      console.log('JSON Response:', jsonResponse);
      return res.json(jsonResponse);
    } else if (contentType.includes('text/')) {
      const textResponse = await response.text();
      return res.send(textResponse);
    } else {
      // For binary data, files, etc. - stream the response
      response.body.pipe(res);
      return;
    }
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    // Graceful error handling with specific error types
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return res.status(504).json({ 
        error: 'Gateway timeout', 
        message: 'Backend service took too long to respond' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Service unavailable', 
        message: 'Cannot connect to backend service' 
      });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(502).json({ 
        error: 'Bad gateway', 
        message: 'Backend service not found' 
      });
    }
    
    // Generic server error
    return res.status(500).json({ 
      error: 'Internal proxy error', 
      message: 'An unexpected error occurred while proxying the request' 
    });
  }
};

module.exports = actualProxy;



// const proxy = createProxyMiddleware({
//   target: 'http://localhost:4000',
//   changeOrigin: true,
//   pathRewrite: (path, req) => {
//     const { id } = req.params;
//     // Remove the route prefix to get the remaining path
//     const routePrefix = `/api/workspace/${id}`;
//     const remainingPath = req.originalUrl.replace(routePrefix, '');

//     const rewrittenPath = `/proxy/runtime-${id}${remainingPath}`;
//     console.log('Original path:', req.originalUrl);
//     console.log('Rewritten path:', rewrittenPath);

//     return rewrittenPath;
//   },
//   onProxyReq: (proxyReq, req, res) => {
//     // The target is already set in the proxy config, just log the path
//     console.log('🔁 Outgoing Proxy Request → http://localhost:4000' + proxyReq.path);
//   },
//   onError: (err, req, res) => {
//     console.error('❌ Proxy Error:', err.message);
//     if (!res.headersSent) {
//       res.status(500).json({ error: err.message || 'Proxy error' });
//     }
//   }
// });

