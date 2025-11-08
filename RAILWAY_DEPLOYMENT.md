# Railway Deployment Guide

This guide will walk you through deploying the Basel Compliance Application to Railway.

## Prerequisites

- GitHub account
- Railway account (sign up at https://railway.app)
- Git installed locally

## Step 1: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name: `basel-compliance-app` (or your preferred name)
   - Visibility: Private or Public (your choice)
   - Do NOT initialize with README, .gitignore, or license

2. Connect your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/basel-compliance-app.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard (Recommended)

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select your `basel-compliance-app` repository
6. Railway will automatically detect the configuration

### Option B: Deploy via Railway CLI

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   railway init
   ```

4. Deploy:
   ```bash
   railway up
   ```

## Step 3: Configure Environment Variables

After deployment, set these environment variables in Railway:

1. Go to your project in Railway dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add the following variables:

```
NODE_ENV=production
JWT_SECRET=<generate-a-secure-random-string-here>
DATABASE_PATH=/data/production.db
```

**Note:** Don't set PORT - Railway sets this automatically

**Generate a secure JWT_SECRET:**
```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 4: Add Persistent Storage (Important!)

Railway deployments are ephemeral by default. To persist the SQLite database:

1. In your Railway service, go to "Settings" tab
2. Scroll to "Volumes" section
3. Click "New Volume"
4. Set mount path: `/data`
5. Set size: 1GB (adjust as needed)
6. Click "Add"

**CRITICAL:** Make sure the `DATABASE_PATH` environment variable is set to `/data/production.db` to match the volume mount path.

This ensures your database survives redeployments.

## Step 5: Verify Deployment

1. Once deployed, Railway will provide a URL (e.g., `https://basel-compliance-app-production.up.railway.app`)

2. Test the health endpoint:
   ```bash
   curl https://your-app-url.railway.app/health
   ```

3. You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-29T...",
     "environment": "production",
     "database": "connected"
   }
   ```

4. Visit your app URL in a browser to access the application

## Architecture Notes

- **Single Service**: Both frontend and backend are deployed as a single service
- **Static Files**: The server serves the built React app from `/client/dist`
- **API Routes**: All API calls go to `/api/*` endpoints
- **Database**: SQLite database stored in persistent volume
- **Port**: Application listens on PORT environment variable (Railway assigns this)

## Build Process

Railway automatically runs these commands:

1. `npm install` - Installs all dependencies (workspace aware)
2. `npm run build` - Builds both client and server:
   - Client: `vite build` → `client/dist/`
   - Server: `tsc` → `server/dist/`
3. `npm start` - Runs `node server/dist/server.js`

The server then serves the static client files and API endpoints together.

## Monitoring

### View Logs
- In Railway dashboard, go to your service
- Click "Deployments" tab
- Click on latest deployment
- View real-time logs

### Health Checks
- Railway automatically monitors the `/health` endpoint
- Service restarts on failure (configured in `railway.json`)

## Custom Domain (Optional)

1. In Railway dashboard, go to "Settings" tab
2. Scroll to "Domains" section
3. Click "Generate Domain" for a Railway subdomain
4. Or click "Custom Domain" to add your own domain

## Troubleshooting

### Build Failures

If build fails, check Railway logs:
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `npm run build`

### Database Issues

If database isn't persisting across deployments:
- Verify persistent volume is mounted to `/data` (in Settings → Volumes)
- Verify `DATABASE_PATH` environment variable is set to `/data/production.db`
- Check logs for database initialization messages
- The volume and DATABASE_PATH **must** match exactly

### CORS Issues

The app is configured to accept all origins in production. If you need stricter CORS:
1. Update `server/src/server.ts` corsOptions
2. Set specific allowed origins

### Port Issues

Railway automatically sets the PORT variable. The app is configured to use:
```typescript
app.listen(config.port, '0.0.0.0', ...)
```

Don't hardcode port 3020 in production.

## Development vs Production

| Feature | Development | Production (Railway) |
|---------|------------|---------------------|
| Client | Vite dev server (5173) | Static files from `dist/` |
| Server | ts-node + nodemon (3020) | Compiled JS from `dist/` |
| API URL | `http://localhost:3020/api` | Relative `/api` |
| Database | `./database/dev.db` | `/data/production.db` (persistent volume) |
| CORS | localhost:5173 only | All origins |
| Hot Reload | Yes | No |

## Next Steps

After successful deployment:

1. Create your first user account
2. Test the notification form
3. Load test data to verify functionality
4. Set up monitoring/alerts in Railway
5. Configure custom domain if desired

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: [Your repo URL]

---

Generated with [Claude Code](https://claude.com/claude-code)
