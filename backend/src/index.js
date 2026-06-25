require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database.config');
const { startSyncJob } = require('./jobs/polymarketSync');
const { seedUsersIfEmpty, seedContentIfEmpty } = require('./seed');

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
