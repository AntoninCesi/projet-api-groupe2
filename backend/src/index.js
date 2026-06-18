require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.config');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Breezy backend is running on port ${PORT}`));
});