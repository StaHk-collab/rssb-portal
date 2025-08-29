# RSSB Sewadar Management Application

A comprehensive full-stack application for managing volunteer (sewadar) records for Radha Soami Satsang Beas, built as a production-ready monorepo with role-based access control.

## 🏗️ Architecture Overview

This monorepo contains:
- **Backend**: Node.js/Express API with SQLite database
- **Frontend**: React 18+ with modern UI components
- **Deployment**: Firebase Hosting with GitHub Actions CI/CD
- **Documentation**: Comprehensive guides and API reference

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase CLI (for deployment)

### Local Development

1. **Install dependencies**:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. **Start backend** (from root):
```bash
cd backend && npm run dev
```

3. **Start frontend** (new terminal, from root):
```bash
cd frontend && npm start
```

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Documentation: http://localhost:5000/api/docs

### Default Users (for testing)
- **Admin**: admin@rssb.org / admin123
- **Editor**: editor@rssb.org / editor123  
- **Viewer**: viewer@rssb.org / viewer123

## 📁 Project Structure

```
rssb-sewadar-app/
├── backend/              # Node.js/Express API
├── frontend/             # React application
├── .github/workflows/    # CI/CD configuration
├── docs/                # Complete documentation
├── firebase.json        # Firebase hosting config
└── .firebaserc         # Firebase project mapping
```

## 🎯 Features

- **Authentication**: JWT-based with role management
- **Role-Based Access**: Admin/Editor/Viewer permissions
- **Sewadar Management**: Complete CRUD operations
- **Audit Trail**: Track all user actions and changes
- **Responsive Design**: Mobile-first with RSSB branding
- **Production Ready**: Error handling, validation, security

## 📚 Documentation

- [Color Guide](./docs/COLOR_GUIDE.md) - Complete brand color system
- [Deployment Guide](./docs/DEPLOYMENT.md) - Firebase hosting setup
- [API Reference](./docs/API_REFERENCE.md) - Complete API documentation
- [Product HLD](./docs/PRODUCT_HLD.md) - High-level design overview

## 🚀 Deployment

This project is configured for automatic deployment to Firebase Hosting via GitHub Actions. See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete setup instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for Radha Soami Satsang Beas**