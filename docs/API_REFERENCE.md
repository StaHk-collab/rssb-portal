# RSSB Sewadar Management - API Reference

Complete API documentation for the RSSB Sewadar Management system. This RESTful API provides endpoints for authentication, sewadar management, user administration, and audit logging.

## 📋 Base Information

- **Base URL**: `https://your-domain.com/api`
- **Version**: 1.0.0
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`
- **Rate Limiting**: 100 requests per 15 minutes per IP

## 🔐 Authentication

All API endpoints (except login) require authentication via JWT Bearer token.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "details": [] // Optional validation details
}
```

## 🚀 Quick Start

### 1. Login
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rssb.org",
    "password": "admin123"
  }'
```

### 2. Use Token
```bash
curl -X GET https://your-domain.com/api/sewadars \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔑 Authentication Endpoints

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@rssb.org",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@rssb.org",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

**Error Responses:**
- `400`: Invalid credentials
- `401`: Authentication failed
- `429`: Too many login attempts

---

### POST /auth/register
Register new user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newuser@rssb.org",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "EDITOR"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "newuser@rssb.org",
    "firstName": "New",
    "lastName": "User",
    "role": "EDITOR"
  }
}
```

---

### GET /auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@rssb.org",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /auth/logout
Logout current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👥 Sewadar Management Endpoints

### GET /sewadars
Get paginated list of sewadars with filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 10): Items per page
- `search` (string): Search in name or verification ID
- `naamdanStatus` (boolean): Filter by naamdan status
- `verificationType` (string): Filter by verification type (AADHAR, PAN, OTHER)

**Example Request:**
```bash
GET /api/sewadars?page=1&limit=10&search=rajesh&naamdanStatus=true
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Rajesh",
      "lastName": "Sharma",
      "age": 45,
      "verificationId": "1234-5678-9012",
      "verificationType": "AADHAR",
      "naamdanStatus": true,
      "naamdanId": "ND001",
      "badgeId": "B001",
      "createdBy": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdByFirstName": "Admin",
      "createdByLastName": "User"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### GET /sewadars/:id
Get sewadar by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Rajesh",
    "lastName": "Sharma",
    "age": 45,
    "verificationId": "1234-5678-9012",
    "verificationType": "AADHAR",
    "naamdanStatus": true,
    "naamdanId": "ND001",
    "badgeId": "B001",
    "createdBy": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdByFirstName": "Admin",
    "createdByLastName": "User",
    "createdByEmail": "admin@rssb.org"
  }
}
```

**Error Responses:**
- `404`: Sewadar not found

---

### POST /sewadars
Create new sewadar (Admin/Editor only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Priya",
  "lastName": "Singh",
  "age": 38,
  "verificationId": "ABCDE1234F",
  "verificationType": "PAN",
  "naamdanStatus": false,
  "naamdanId": "",
  "badgeId": "B002"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Sewadar created successfully",
  "data": {
    "id": "uuid",
    "firstName": "Priya",
    "lastName": "Singh",
    "age": 38,
    "verificationId": "ABCDE1234F",
    "verificationType": "PAN",
    "naamdanStatus": false,
    "naamdanId": null,
    "badgeId": "B002",
    "createdBy": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation Rules:**
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters  
- `age`: Optional, 1-120
- `verificationType`: Optional, must be AADHAR, PAN, or OTHER
- `verificationId`: Optional, max 50 characters
- `naamdanId`: Optional, max 20 characters
- `badgeId`: Optional, max 20 characters

---

### PUT /sewadars/:id
Update existing sewadar (Admin/Editor only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (All fields optional)
```json
{
  "firstName": "Updated Name",
  "naamdanStatus": true,
  "naamdanId": "ND123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sewadar updated successfully",
  "data": {
    // Updated sewadar object
  }
}
```

---

### DELETE /sewadars/:id
Delete sewadar (Admin/Editor only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Sewadar deleted successfully"
}
```

---

### GET /sewadars/stats/summary
Get sewadar statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "naamdanComplete": 120,
    "naamdanPending": 30,
    "recentlyAdded": 15,
    "byVerificationType": {
      "AADHAR": 80,
      "PAN": 50,
      "OTHER": 20
    }
  }
}
```

---

## 👤 User Management Endpoints (Admin Only)

### GET /users
Get all users.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "admin@rssb.org",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /users/:id
Get user by ID.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@rssb.org",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "stats": {
      "sewadarsCreated": 25
    }
  }
}
```

---

### PUT /users/:id
Update user.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "EDITOR",
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    // Updated user object
  }
}
```

---

### POST /users/:id/reset-password
Reset user password.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### DELETE /users/:id
Delete user.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Restrictions:**
- Cannot delete your own account
- Cannot delete users who have created sewadars

---

## 📋 Audit Log Endpoints (Admin Only)

### GET /audit
Get audit logs with filtering.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 50): Items per page
- `action` (string): Filter by action type
- `userId` (string): Filter by user ID
- `entity` (string): Filter by entity type

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "CREATE_SEWADAR",
      "userId": "uuid",
      "entity": "SEWADAR",
      "entityId": "uuid",
      "details": "Created sewadar: Rajesh Sharma",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "userFirstName": "Admin",
      "userLastName": "User",
      "userEmail": "admin@rssb.org"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 200,
    "totalPages": 4
  }
}
```

---

### GET /audit/stats
Get audit statistics.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalActions": 500,
    "todaysActions": 25,
    "thisWeekActions": 150,
    "byAction": {
      "LOGIN": 200,
      "CREATE_SEWADAR": 100,
      "UPDATE_SEWADAR": 80,
      "DELETE_SEWADAR": 20
    },
    "byUser": [
      {
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@rssb.org",
        "actionCount": 150
      }
    ],
    "recentActions": [
      // Last 10 audit log entries
    ]
  }
}
```

---

## 🏥 System Endpoints

### GET /health
Health check endpoint (no authentication required).

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 📊 HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Duplicate resource |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

---

## 🔒 Security

### Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### CORS
- **Allowed Origins**: Configured per environment
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization

### Input Validation
All endpoints validate input using Joi schemas:
- Required fields validation
- Data type validation  
- Length and format validation
- SQL injection prevention

---

## 📝 Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Sewadar Model
```typescript
interface Sewadar {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
  verificationId?: string;
  verificationType?: 'AADHAR' | 'PAN' | 'VOTER_ID' | 'PASSPORT';
  naamdanStatus: boolean;
  naamdanId?: string;
  badgeId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Audit Log Model
```typescript
interface AuditLog {
  id: string;
  action: string;
  userId: string;
  entity: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}
```

---

## 🧪 Testing

### Example Test Requests

#### Login and Get Sewadars
```bash
# Login
TOKEN=$(curl -s -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rssb.org","password":"admin123"}' \
  | jq -r '.token')

# Get sewadars
curl -X GET https://your-domain.com/api/sewadars \
  -H "Authorization: Bearer $TOKEN"
```

#### Create Sewadar
```bash
curl -X POST https://your-domain.com/api/sewadars \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "age": 30,
    "verificationType": "AADHAR",
    "verificationId": "1234-5678-9012"
  }'
```

---

## 🐛 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    }
  ]
}
```

### Common Error Messages
- `"Access token required"` - Missing Authorization header
- `"Invalid or expired token"` - Invalid JWT token
- `"Insufficient permissions"` - User lacks required role
- `"Validation failed"` - Request data validation errors
- `"Resource not found"` - Requested resource doesn't exist

---

## 📚 Additional Resources

- **Interactive API Docs**: `https://your-domain.com/api/docs`
- **Postman Collection**: Available in repository
- **OpenAPI Spec**: Generated automatically from code
- **Rate Limiting**: Monitor usage in Firebase Console

---

**For support or questions about the API, please contact the development team or create an issue in the GitHub repository.**