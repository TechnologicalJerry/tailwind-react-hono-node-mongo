# Modern Full-Stack Application

This is a modern, full-stack web application completely separated into a React 19 Frontend and a Node.js/Hono Backend.

## 🚀 Tech Stack

### Frontend
- **React 19**
- **TypeScript 5+**
- **Webpack 5** (Custom Config)
- **React Router DOM v7**
- **Axios** (with Interceptors for Token Refresh)
- **Context API** (State Management)
- **Vanilla CSS** (Modern UI, CSS Variables)

### Backend
- **Node.js LTS**
- **Hono** (Fast, Edge-Ready Web Framework)
- **TypeScript 5+**
- **MongoDB & Mongoose**
- **JWT & bcryptjs**
- **Zod** (Validation)

---

## 📂 Project Structure

\`\`\`
.
├── backend/                  # Hono + Node.js API
│   ├── src/
│   │   ├── config/           # Environment & DB setup
│   │   ├── middlewares/      # Auth, Roles, Error Handling
│   │   ├── modules/          # Domain-driven feature modules (Auth, Users, Products)
│   │   ├── utils/            # Reusable utilities (Responses, Loggers)
│   │   ├── app.ts            # Hono App Instance
│   │   └── server.ts         # Server Entry Point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React 19 SPA
│   ├── src/
│   │   ├── api/              # Axios instance and interceptors
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth)
│   │   ├── pages/            # Page components
│   │   ├── routes/           # Protected and Public Routes
│   │   ├── styles/           # Global styles and variables
│   │   ├── App.tsx           # App Root
│   │   └── index.tsx         # Entry Point
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── webpack.config.js     # Custom Webpack 5 setup
└── postman_collection.json   # API Endpoints testing
\`\`\`

---

## 🛠️ Setup Instructions

### 1. Database Setup
Ensure you have **MongoDB** running locally on \`mongodb://127.0.0.1:27017\` or provide a MongoDB Atlas URI.

### 2. Backend Setup
1. Navigate to the backend folder:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file based on \`.env.example\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
4. Start the backend development server:
   \`\`\`bash
   npm run dev
   \`\`\`
   *(Server runs on http://localhost:5000)*

### 3. Frontend Setup
1. Navigate to the frontend folder:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file based on \`.env.example\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
4. Start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`
   *(App runs on http://localhost:3000)*

---

## 🏗️ Build & Production Recommendations

### Build Frontend
To create a production-ready bundle of the React app:
\`\`\`bash
cd frontend
npm run build
\`\`\`
*This will generate a \`dist\` folder containing optimized HTML, CSS, and JS. You can serve this folder using Nginx, Apache, or any static hosting service.*

### Build Backend
To compile the TypeScript code to JavaScript for production:
\`\`\`bash
cd backend
npm run build
\`\`\`
*Start the production server using \`npm start\`.*

### Production Best Practices
1. **Environment Variables**: Always use secure, random strings for \`JWT_ACCESS_SECRET\` and \`JWT_REFRESH_SECRET\`.
2. **Reverse Proxy**: Use Nginx or Caddy to reverse proxy requests to the Node.js backend.
3. **Process Management**: Use PM2 or Docker to manage the backend process.
4. **HTTPS**: Always serve the application over HTTPS in production.
5. **CORS**: Strictly define the \`CLIENT_URL\` in production so that only your trusted frontend domain can make requests.
6. **Rate Limiting**: Add a rate-limiter middleware on the API to prevent brute-force attacks.

---

## 📚 API Documentation

### Auth Module
- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login and receive JWT & Refresh Cookie
- **POST /api/auth/logout** - Clear the refresh token cookie
- **POST /api/auth/refresh** - Get a new access token using the HTTP-only cookie
- **GET /api/auth/me** - Get current logged-in user profile

### Users Module (Requires Auth)
- **GET /api/users** - List all users (Admin only, supports pagination & search)
- **GET /api/users/:id** - Get a user (Admin or Self)
- **PUT /api/users/:id** - Update a user (Admin or Self)
- **DELETE /api/users/:id** - Delete a user (Admin only)

### Products Module
- **GET /api/products** - List all products (Public, supports pagination, search & category filters)
- **GET /api/products/:id** - Get product details (Public)
- **POST /api/products** - Create a product (Requires Auth)
- **PUT /api/products/:id** - Update a product (Admin or Creator only)
- **DELETE /api/products/:id** - Delete a product (Admin or Creator only)

---

## 📌 Deliverables Included
✅ Complete Frontend & Backend separated apps  
✅ Webpack 5 + React 19 Setup  
✅ Hono + Node LTS Setup  
✅ Advanced Authentication (JWT + HTTP-Only Refresh Tokens)  
✅ Role-Based Access Control (Admin/User)  
✅ Responsive CSS UI  
✅ Postman Collection Included  
