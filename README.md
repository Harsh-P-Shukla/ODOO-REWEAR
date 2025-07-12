TEAM NAME :- ALPHA CODER

TEAM MEMBERS:-
1. SIDDHIT KALE : D23CS102@CHARUSAT.EDU.IN
2. HARSH SHUKLA : D23DCS162@CHARUSAT.EDU.IN
3. DHRUV PATEL
4. MEET PARMAR

# ReWear - Community Clothing Exchange

A modern web application for swapping and exchanging clothing items with a credit-based system.

## Features

- 🔐 User authentication with JWT
- 💰 Credit/points system for item exchanges
- 🛍️ Item browsing and management
- 📊 User dashboard with statistics
- 💳 Credit purchase system
- 🔄 Swap request management

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, MongoDB, Mongoose
- **Authentication:** JWT tokens
- **Styling:** Tailwind CSS, Framer Motion

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Setup

You need MongoDB running locally or use MongoDB Atlas.

**Option A: Local MongoDB**
1. Install MongoDB Community Server
2. Start MongoDB service
3. Create database: `rewear`

**Option B: MongoDB Atlas (Recommended)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/rewear
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rewear

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3002`

## Database Schema

### Users
- Basic info (name, email, password)
- Points balance
- User statistics
- Preferences and settings

### Items
- Item details (title, description, images)
- Category and condition
- Points value
- Status (available, swapped, pending)

### Transactions
- Point purchases
- Point deductions
- Transfer history

### Swap Requests
- Request details
- Status tracking
- Communication history

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Credits
- `GET /api/credits/purchase` - Get credit packages
- `POST /api/credits/purchase` - Purchase credits
- `GET /api/credits/transactions` - Get transaction history

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get item details
- `POST /api/items/redeem` - Redeem item with points

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

2. **Test database connection:**
   Visit `http://localhost:3002/api/test-db`

3. **Check environment variables:**
   Ensure `MONGODB_URI` is set correctly

### Registration Issues

1. **Password validation:** Password must be at least 6 characters
2. **Email validation:** Must be a valid email format
3. **Duplicate email:** Each email can only be used once

### Common Errors

- **"Password must be at least 6 characters"** - Use a longer password
- **"User already exists"** - Try a different email address
- **"Database connection failed"** - Check MongoDB connection

## Development

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # User dashboard
│   └── ...
├── components/         # React components
├── lib/               # Utilities and helpers
├── models/            # MongoDB models
└── types/             # TypeScript types
```

### Adding New Features

1. Create API routes in `src/app/api/`
2. Add models in `src/models/`
3. Create components in `src/components/`
4. Add pages in `src/app/`

## Production Deployment

1. Set up environment variables
2. Configure MongoDB Atlas
3. Deploy to Vercel, Netlify, or your preferred platform

## License

MIT License
