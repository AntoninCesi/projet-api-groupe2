require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.config');

const app = express();
app.use(express.json());
app.use('/posts', require('./config/database.confg'));

const PORT = process.env.PORT || 3003;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Post service is running on port ${PORT}`));
});