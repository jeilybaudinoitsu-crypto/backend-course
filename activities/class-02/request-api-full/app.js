import express from 'express';
import requestsRoutes from './routes/requests.routes.js';

const app = express();

app.use(express.json());

app.use(requestsRoutes);

export default app;
