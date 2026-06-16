require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.config');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Breezy backend is running on port ${PORT}`));
});