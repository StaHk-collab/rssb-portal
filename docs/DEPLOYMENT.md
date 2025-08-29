# RSSB Sewadar Management - Deployment Guide

This comprehensive guide walks through setting up Firebase Hosting with custom domain, GitHub Actions CI/CD, and environment configuration for the RSSB Sewadar Management application.

## 🚀 Overview

The application uses Firebase Hosting for both frontend (React) and backend (Node.js) deployment with automatic CI/CD through GitHub Actions.

### Architecture
- **Frontend**: React SPA served from Firebase Hosting
- **Backend**: Node.js API running as Firebase Function  
- **Database**: SQLite with automatic initialization
- **CI/CD**: GitHub Actions for automated deployment
- **Monitoring**: Firebase Analytics and Performance

## 📋 Prerequisites

Before starting deployment, ensure you have:

- [Firebase CLI](https://firebase.google.com/docs/cli) installed
- [Node.js](https://nodejs.org/) 18+ installed
- Firebase project created
- GitHub repository set up
- Custom domain (optional)

## 🔧 Firebase Setup

### Step 1: Create Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Click "Create a project"**
3. **Enter project details:**
   ```
   Project Name: RSSB Sewadar Management
   Project ID: rssb-sewadar-management
   ```
4. **Enable Analytics** (recommended)
5. **Click "Create project"**

### Step 2: Initialize Firebase in Your Project

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project root
firebase init
```

**During initialization, select:**
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Functions: Configure a Cloud Functions directory
- Choose existing project: `rssb-sewadar-management`
- Functions language: JavaScript
- ESLint: Yes
- Install dependencies: Yes
- Public directory: `dist`
- Single-page app: Yes
- GitHub deploys: Yes (we'll configure this manually)

### Step 3: Configure Firebase Hosting

Update `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🌐 Custom Domain Setup

### Step 1: Add Custom Domain

1. **In Firebase Console, go to Hosting**
2. **Click "Add custom domain"**
3. **Enter your domain** (e.g., `sewadar.rssb.org`)
4. **Follow verification steps:**
   - Add TXT record to your DNS
   - Wait for verification (can take 24 hours)

### Step 2: DNS Configuration

Add these records to your DNS provider:

```
Type: A
Name: sewadar (or @)
Value: 151.101.1.195

Type: A  
Name: sewadar (or @)
Value: 151.101.65.195

Type: CNAME
Name: www
Value: sewadar.rssb.org
```

### Step 3: SSL Certificate

Firebase automatically provisions SSL certificates. Wait for:
- ✅ Domain verification
- ✅ SSL certificate provisioned
- ✅ Domain status: Connected

## 🔄 GitHub Actions CI/CD

### Step 1: Repository Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `FIREBASE_TOKEN` | Firebase CLI token | `1//0x...` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `rssb-sewadar-management` |
| `FIREBASE_HOSTING_URL` | Custom domain or Firebase URL | `sewadar.rssb.org` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |

#### Getting Firebase Token

```bash
firebase login:ci
```

Copy the generated token to `FIREBASE_TOKEN` secret.

### Step 2: Environment Configuration

#### Backend Environment Variables

The deployment automatically creates these environment variables:

```bash
DATABASE_URL=./database/sewadar.db
JWT_SECRET=${FIREBASE_JWT_SECRET}
NODE_ENV=production
PORT=5000
CORS_ORIGINS=https://your-domain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

#### Frontend Environment Variables

```bash
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_NAME=RSSB Sewadar Management
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

### Step 3: Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Builds the application** on push to `main`
2. **Runs tests** and security audits
3. **Deploys to Firebase** Hosting
4. **Performs health checks** post-deployment

#### Manual Deployment

```bash
# Build frontend
cd frontend && npm run build

# Prepare distribution
mkdir -p dist
cp -r frontend/build/* dist/
cp -r backend/src dist/api/

# Deploy
firebase deploy --only hosting
```

## 🗄️ Database Setup

### Automatic Initialization

The deployment process automatically:
1. Creates SQLite database
2. Runs migrations to create tables
3. Seeds initial data (admin, editor, viewer accounts)

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
  isActive BOOLEAN DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sewadars table  
CREATE TABLE sewadars (
  id TEXT PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  age INTEGER,
  verificationId TEXT,
  verificationType TEXT CHECK (verificationType IN ('AADHAR', 'PAN', 'VOTER_ID', 'PASSPORT')),
  naamdanStatus BOOLEAN DEFAULT 0,
  naamdanId TEXT,
  badgeId TEXT,
  createdBy TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  userId TEXT NOT NULL,
  entity TEXT NOT NULL,
  entityId TEXT,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Initial User Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@rssb.org | admin123 | Full access, user management |
| **Editor** | editor@rssb.org | editor123 | CRUD operations on sewadars |
| **Viewer** | viewer@rssb.org | viewer123 | Read-only access |

## 🏥 Health Monitoring

### Health Check Endpoints

The application provides monitoring endpoints:

- **Frontend Health**: `https://your-domain.com/`
- **API Health**: `https://your-domain.com/api/health`
- **API Docs**: `https://your-domain.com/api/docs`

### Firebase Monitoring

Enable in Firebase Console:
1. **Performance Monitoring**: Track app performance
2. **Analytics**: User behavior and usage patterns  
3. **Crashlytics**: Error reporting and crash logs

### Uptime Monitoring

Set up external monitoring:
```bash
# Example using curl for health checks
curl -f https://your-domain.com/api/health || exit 1
```

## 🔧 Environment-Specific Deployments

### Multiple Environments

Configure different environments in `.firebaserc`:

```json
{
  "projects": {
    "default": "rssb-se wadar-management",
    "development": "rssb-sewadar-dev",
    "staging": "rssb-sewadar-staging",
    "production": "rssb-sewadar-prod"
  }
}
```

### Deploy to Specific Environment

```bash
# Deploy to staging
firebase use staging
firebase deploy

# Deploy to production  
firebase use production
firebase deploy
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Frontend build fails
```bash
Error: Module not found
```

**Solution**: 
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. API Not Accessible

**Problem**: API returns 404 errors

**Solution**: Check `firebase.json` rewrites:
```json
{
  "rewrites": [
    {
      "source": "/api/**",
      "function": "api"
    }
  ]
}
```

#### 3. Database Connection Issues

**Problem**: Database file not found

**Solution**: Ensure database initialization:
```bash
cd backend
npm run migrate
npm run seed
```

#### 4. CORS Errors

**Problem**: Frontend can't access API

**Solution**: Update CORS origins in backend:
```javascript
const corsOptions = {
  origin: ['https://your-domain.com'],
  credentials: true
};
```

### Debug Mode

Enable debug logging:
```bash
# Backend debug
NODE_ENV=development npm start

# Firebase debug
firebase serve --debug
```

### Log Analysis

Check Firebase Function logs:
```bash
firebase functions:log
```

## 📊 Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Implemented with React.lazy()
2. **Asset Optimization**: Images compressed and optimized
3. **Caching**: Static assets cached for 1 year
4. **Bundle Analysis**: Use webpack-bundle-analyzer

### Backend Optimization

1. **Database Indexing**: Indexes on frequently queried columns
2. **Response Caching**: Cache static responses
3. **Rate Limiting**: Prevent API abuse
4. **Compression**: Gzip compression enabled

### Firebase Optimization

1. **Hosting Cache**: Configure cache headers
2. **Function Cold Starts**: Keep functions warm
3. **Bundle Size**: Minimize function bundle size

## 🔐 Security Considerations

### Environment Variables

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly

### API Security

- JWT token authentication
- Rate limiting enabled
- CORS properly configured
- Input validation on all endpoints

### Database Security

- Parameterized queries prevent SQL injection
- User role-based access control
- Audit logging for all actions

## 📈 Scaling Considerations

### Traffic Growth

- Firebase Hosting auto-scales
- Monitor usage in Firebase Console
- Consider CDN for global distribution

### Database Scaling

- Current SQLite suitable for moderate usage
- Consider PostgreSQL for high-volume usage
- Implement database connection pooling

### Cost Management

- Monitor Firebase usage and billing
- Set up billing alerts
- Optimize function execution time

## 🆘 Support and Maintenance

### Regular Maintenance

1. **Weekly**: Check error logs and performance
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review and optimize performance
4. **Annually**: Security audit and penetration testing

### Backup Strategy

1. **Database**: Automated daily backups
2. **Code**: Git repository with tags for releases
3. **Configuration**: Document all environment variables

### Emergency Procedures

1. **Rollback**: Use Firebase Hosting rollback feature
2. **Hotfix**: Emergency deployment process
3. **Communication**: Notify users of maintenance

---

## 📞 Getting Help

- **Firebase Support**: [Firebase Support](https://firebase.google.com/support)
- **GitHub Issues**: Create issues in the repository
- **Documentation**: Refer to API documentation at `/api/docs`
- **Team Contact**: Contact the development team for urgent issues

---

**This deployment guide ensures a robust, scalable, and maintainable deployment of the RSSB Sewadar Management application.**