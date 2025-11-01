import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { initializeDatabase } from './database/sqlite';

console.log('');
console.log('🚀 ============================================');
console.log('🚀 Basel Compliance Server Starting...');
console.log('🚀 ============================================');
console.log(`📍 Node version: ${process.version}`);
console.log(`📍 Platform: ${process.platform}`);
console.log(`📍 Environment: ${config.nodeEnv}`);
console.log(`📍 Port: ${config.port}`);
console.log(`📍 Database path: ${config.databasePath}`);
console.log('🚀 ============================================');
console.log('');

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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize database
console.log('🔧 Initializing database...');
try {
  initializeDatabase();
  console.log('✅ Database initialization complete');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

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
  console.log('🔍 Looking for client build files...');
  // Try multiple possible paths for the client build
  const possiblePaths = [
    path.join(__dirname, '../../client/dist'),           // From server/dist
    path.join(process.cwd(), 'client/dist'),             // From project root
    path.join(__dirname, '../../../client/dist'),        // Alternative path
  ];

  console.log('📍 Checking paths:');
  possiblePaths.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));

  let clientBuildPath = possiblePaths[0];
  let found = false;
  for (const testPath of possiblePaths) {
    const indexPath = path.join(testPath, 'index.html');
    console.log(`🔍 Checking: ${indexPath}`);
    if (require('fs').existsSync(indexPath)) {
      clientBuildPath = testPath;
      console.log(`✅ Found client build at: ${clientBuildPath}`);
      found = true;
      break;
    }
  }

  if (!found) {
    console.warn(`⚠️  Client build not found, using default: ${clientBuildPath}`);
  }

  // Serve static files but exclude API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    express.static(clientBuildPath)(req, res, next);
  });
  console.log(`✅ Serving static files from: ${clientBuildPath}`);

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
console.log(`🔧 Starting server on port ${config.port}...`);
try {
  app.listen(config.port, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 ============================================');
    console.log('🚀 Basel Compliance App - Server Started');
    console.log('🚀 ============================================');
    console.log(`✅ Server running on port ${config.port}`);
    console.log(`✅ Environment: ${config.nodeEnv}`);
    console.log(`✅ CORS enabled for: ${config.corsOrigin}`);
    console.log(`✅ Health check: http://0.0.0.0:${config.port}/health`);
    console.log('🚀 ============================================');
    console.log('');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
