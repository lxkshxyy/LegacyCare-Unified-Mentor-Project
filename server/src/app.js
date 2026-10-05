const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.set('trust proxy', 1); // correct client IPs behind Vercel / Render proxies

const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
// Allow configured origins, plus same-origin requests (frontend and API served from one domain)
app.use(
  cors((req, cb) => {
    const origin = req.header('Origin');
    let sameHost = false;
    try {
      sameHost = !!origin && new URL(origin).host === req.headers.host;
    } catch {
      sameHost = false;
    }
    const ok = !origin || sameHost || allowed.includes(origin) || allowed.includes('*');
    cb(ok ? null : Object.assign(new Error('Origin not allowed'), { status: 403 }), { origin: ok });
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'legacycare-api', time: new Date().toISOString() }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
