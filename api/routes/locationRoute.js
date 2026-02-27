import express from "express";
import mongoose from "mongoose";
import Location from "../models/locationModel.js";

const locationRoute = express.Router();

locationRoute.post('/api/location', async (req, res) => {
    try {
        console.log("=".repeat(50));
        console.log("📥 POST /api/location request received");
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        
        // 1. Check MongoDB connection
        const dbState = mongoose.connection.readyState;
        const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        console.log("📊 MongoDB State:", dbStates[dbState] || 'unknown', `(${dbState})`);
        
        if (dbState !== 1) {
            console.log("❌ MongoDB not connected!");
            
            // Try to connect manually
            try {
                console.log("🔄 Attempting to connect to MongoDB...");
                const MONGO_URI = process.env.MONGO_URI;
                
                if (!MONGO_URI) {
                    throw new Error("MONGO_URI not found in environment");
                }
                
                await mongoose.connect(MONGO_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 5000
                });
                console.log("✅ MongoDB connected manually!");
            } catch (connError) {
                console.error("❌ Manual connection failed:", connError.message);
                return res.status(500).json({ 
                    message: 'Database connection failed',
                    error: connError.message,
                    dbState: dbState
                });
            }
        }
        
        // 2. Check if Location model exists
        console.log("📦 Location model:", mongoose.models.Location ? 'exists' : 'not exists');
        
        // 3. Validate data
        const data = req.body;
        if (!data || !data.coords) {
            console.log("❌ Invalid data - missing coords");
            return res.status(400).json({ 
                message: 'Invalid data: coords are required',
                received: data 
            });
        }
        
        // 4. Create and save location
        const locationData = {
            timestamp: data.timestamp || Date.now(),
            coords: {
                latitude: data.coords.latitude,
                longitude: data.coords.longitude,
                accuracy: data.coords.accuracy || 0
            }
        };
        
        console.log("📦 Saving location:", locationData);
        
        const location = new Location(locationData);
        const savedLocation = await location.save();
        
        console.log("✅ Location saved successfully. ID:", savedLocation._id);
        console.log("=".repeat(50));
        
        res.status(200).json({ 
            message: 'Location saved successfully',
            id: savedLocation._id
        });
        
    } catch (error) {
        console.error("❌ ERROR:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        res.status(500).json({ 
            message: 'Failed to save location', 
            error: error.message,
            errorType: error.name,
            dbState: mongoose.connection.readyState
        });
    }
});

// GET endpoint - test එකට
locationRoute.get('/api/location', async (req, res) => {
    try {
        const locations = await Location.find().sort({ timestamp: -1 }).limit(10);
        res.json({ 
            message: 'Locations fetched',
            count: locations.length,
            data: locations 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default locationRoute;
