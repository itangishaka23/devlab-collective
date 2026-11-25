import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import { sitemap } from './controllers/sitemapController.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import routes from './routes/index.js';

// The Express app lives here (no listen/DB connection) so tests can import it.
const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // images are loaded from another origin (the website)
app.use(
  cors({
    origin: env.clientUrls,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '200kb' }));
if (!env.isProd && env.nodeEnv !== 'test') app.use(morgan('dev'));

// Public images only. Report PDFs are NOT served statically (they go through /api/reports/:id/download).
const staticOpts = { index: false, dotfiles: 'deny', maxAge: '7d', fallthrough: true };
app.use('/uploads/team', express.static(`${env.uploadDir}/team`, staticOpts));
app.use('/uploads/gallery', express.static(`${env.uploadDir}/gallery`, staticOpts));
app.use('/uploads/hosted', express.static(`${env.uploadDir}/hosted`, staticOpts));

app.get('/', (req, res) => res.json({ name: 'DevLab Collective API', docs: '/api/health' }));
app.get('/sitemap.xml', sitemap);
app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
