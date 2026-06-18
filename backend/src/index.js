require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.config');
const postRoutes = require('./routes/post.routes');

const app = express();
app.use(express.json());

app.use('/posts', postRoutes);

const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Breezy backend is running on port ${PORT}`));
});