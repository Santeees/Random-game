/**
 * local server entry file, for local development
 */
import { server, PORT } from './app.js';

/**
 * start server with port
 */
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on port ${PORT} and accessible from network`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});