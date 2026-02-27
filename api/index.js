import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import locationRoute from './routes/locationRoute.js'

dotenv.config()

const app = express()

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json())

const PORT = process.env.PORT || 4000

// Root route
app.get('/', (req, res) => {
    res.send('Server is running successfully!');
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is healthy',
        timestamp: new Date()
    });
});

// Routes
app.use('/', locationRoute)

// Define cached variable for MongoDB connection
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// ✅ නිවැරදි MongoDB connection function (Mongoose 7+)
async function connectDB() {
    if (cached.conn) {
        console.log("✅ Using cached MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            console.error("❌ MONGO_URI is not defined");
            throw new Error('MONGO_URI is not defined');
        }

        console.log("🔄 Connecting to MongoDB...");
        console.log("MONGO_URI starts with:", MONGO_URI.substring(0, 20) + "...");
        
        // ✅ Mongoose 7+ සඳහා options ඉවත් කරන්න
        cached.promise = mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        }).then((mongoose) => {
            console.log("✅ MongoDB Connected Successfully!");
            console.log("Database:", mongoose.connection.name);
            console.log("Host:", mongoose.connection.host);
            return mongoose;
        }).catch(err => {
            console.error("❌ MongoDB Connection Error:", err);
            console.error("Error details:", err.message);
            cached.promise = null;
            throw err;
        });
    }
    
    cached.conn = await cached.promise;
    return cached.conn;
}

// Vercel serverless function handler
export default async function handler(req, res) {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('❌ Handler Error:', error);
        res.status(500).json({ 
            message: 'Database connection failed',
            error: error.message
        });
    }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Local server running on port ${PORT}`)
        connectDB().catch(err => {
            console.error("❌ Local DB connection failed:", err.message);
        });
    });
}
