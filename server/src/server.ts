import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { initializeDatabase } from './database/sqlite';

const app = express();

// Middleware
const corsOptions = config.nodeEnv === 'production'
  ? {
      origin: true,
      credentials: true,
      exposedHeaders: ['Content-Disposition']
    }
  : {
      origin: [config.corsOrigin],
      credentials: true,
      exposedHeaders: ['Content-Disposition']
    };

app.use(cors(corsOptions));
app.use(express.json());

// Initialize database
console.log('🔧 Initializing database...');
initializeDatabase();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: 'connected'
  });
});

// API routes
import authRoutes from './routes/authRoutes';
import packageRoutes from './routes/packageRoutes';
import notificationRoutes from './routes/notificationRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static files in production
if (config.nodeEnv === 'production') {
  // Try multiple possible paths for the client build
  const possiblePaths = [
    path.join(__dirname, '../../client/dist'),           // From server/dist
    path.join(process.cwd(), 'client/dist'),             // From project root
    path.join(__dirname, '../../../client/dist'),        // Alternative path
  ];

  let clientBuildPath = possiblePaths[0];
  for (const testPath of possiblePaths) {
    if (require('fs').existsSync(path.join(testPath, 'index.html'))) {
      clientBuildPath = testPath;
      console.log(`✅ Found client build at: ${clientBuildPath}`);
      break;
    }
  }

  app.use(express.static(clientBuildPath));

  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handler (basic for now)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      ...(config.nodeEnv === 'development' && { stack: err.stack })
    }
  });
});

// Start server
app.listen(config.port, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log('🚀 Basel Compliance App - Server Started');
  console.log('🚀 ============================================');
  console.log(`✅ Server running on port ${config.port}`);
  console.log(`✅ Environment: ${config.nodeEnv}`);
  console.log(`✅ CORS enabled for: ${config.corsOrigin}`);
  console.log(`✅ Health check: http://localhost:${config.port}/health`);
  console.log('🚀 ============================================');
  console.log('');
});
