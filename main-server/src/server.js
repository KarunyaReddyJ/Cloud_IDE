require('dotenv').config();
const connectDB = require('./config/db.config');
const server = require('./socket')

const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(() => {
    console.error('Server not started because MongoDB connection failed.');
    process.exit(1); // Exit with error code
  });
