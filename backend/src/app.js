// Application Express (routes + middlewares), SANS démarrage serveur ni DB.
// Séparée de index.js pour être importable dans les tests (supertest).
const express = require('express');
const cors = require('cors');
const postRoutes = require('./routes/post.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const topicRoutes = require('./routes/topic.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes = require('./routes/message.routes');
const themeRoutes = require('./routes/theme.routes');

const app = express();
app.use(express.json());

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3005'];

app.use(cors({ origin: allowedOrigins }));

app.use('/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/topics', topicRoutes);
app.use('/notifications', notificationRoutes);
app.use('/messages', messageRoutes);
app.use('/themes', themeRoutes);

// Swagger UI at /api-docs — optionnel, nécessite swagger-ui-express + yamljs.
// Gardé sous try/catch pour que l'app démarre même sans ces paquets.
try {
    const path = require('path');
    const swaggerUi = require('swagger-ui-express');
    const YAML = require('yamljs');
    const openapi = YAML.load(path.join(__dirname, '../openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
    console.log('Swagger UI available at /api-docs');
} catch (err) {
    console.log('Swagger UI disabled — run `npm install swagger-ui-express yamljs` to enable /api-docs');
}

module.exports = app;
