import express from "express";
import Location from "../models/locationModel.js"

const locationRoute = express.Router();

locationRoute.post('/api/location', async (req, res) => {
    try {
        const data = req.body;
        const location = new Location(data);
        await location.save();
        res.status(200).json({ message: 'Location saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch location', error: error.message })
    }
})

export default locationRoute