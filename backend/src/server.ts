import app from './app';
import { config } from './config';
import { prisma } from './config/db';

const server = app.listen(config.port, () => {
  console.log(`🚀 BookFlow LMS Server running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.env}`);
});

process.on('SIGINT', async () => {
  console.log('⏳ Gracefully shutting down...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('👋 HTTP server closed.');
    process.exit(0);
  });
});
