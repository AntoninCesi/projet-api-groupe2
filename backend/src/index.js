require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.config');
const postRoutes = require('./routes/post.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const topicRoutes = require('./routes/topic.routes');
const { startSyncJob } = require('./jobs/polymarketSync');

const app = express();
app.use(express.json());

app.use('/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/topics', topicRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    startSyncJob();
    app.listen(PORT, () => console.log(`Breezy backend is running on port ${PORT}`));
});