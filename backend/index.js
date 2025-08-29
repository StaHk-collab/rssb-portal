const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Import your Express app
const app = require('./src/server');

// Initialize Firebase Admin
admin.initializeApp();

// Export the Express app as a Firebase Function
exports.api = functions.region('us-central1').https.onRequest(app);
