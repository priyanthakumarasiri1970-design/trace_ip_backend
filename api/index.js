import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import locationRoute from '../routes/locationRoute.js'

dotenv.config()

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI

app.get('/', (req, res) => {
    res.send('Server is running successfully!');
});

// Routes
app.use('/', locationRoute)

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err))

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)

})
