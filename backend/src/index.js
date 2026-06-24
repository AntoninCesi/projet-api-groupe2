require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.config');
const postRoutes = require('./routes/post.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const topicRoutes = require('./routes/topic.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes = require('./routes/message.routes');
const themeRoutes = require('./routes/theme.routes');
const { startSyncJob } = require('./jobs/polymarketSync');
const { seedUsersIfEmpty, seedContentIfEmpty } = require('./seed');
const cors = require('cors');

const app = express();
app.use(express.json());

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3005'];

app.use(cors({ origin: allowedOrigins }))

app.use('/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/topics', topicRoutes);
app.use('/notifications', notificationRoutes);
app.use('/messages', messageRoutes);
app.use('/themes', themeRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
    // Pré-remplit la base au démarrage (activé via SEED_ON_START en Docker).
    if (process.env.SEED_ON_START === 'true') {
        await seedUsersIfEmpty();
        if (process.env.ENABLE_SYNC === 'false') {
            await seedContentIfEmpty();
        }
    }
    startSyncJob();
    app.listen(PORT, () => console.log(`Breezy backend is running on port ${PORT}`));
});