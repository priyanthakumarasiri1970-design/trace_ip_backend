import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
    {
        timestamp: Number,
        coords: {
            latitude: Number,
            longitude: Number,
            accuracy: Number
        }
    }
)

const Location = mongoose.model('location', locationSchema)
export default Location