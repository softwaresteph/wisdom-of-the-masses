'use strict';
const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const https    = require('https');
const Docker   = require('dockerode');

const app      = express();
const PORT     = process.env.PORT || 3000;
const APP_PATH = process.env.APP_PATH || '';
const SCORES   = path.join('/data', 'scores.json');
const IMAGE    = 'ghcr.io/softwaresteph/wisdom-of-the-masses:latest';

app.use(express.json());

const HTML_FILE = fs.existsSync(path.join(__dirname, 'public', 'index.html'))
  ? path.join(__dirname, 'public', 'index.html')
  : path.join(__dirname, 'catfish-tracker.html');

app.get(['/', APP_PATH, APP_PATH + '/'].filter(Boolean), (req, res) => {
  let html = fs.readFileSync(HTML_FILE, 'utf8');
  html = html.replace("const SERVER_URL = null;", "const SERVER_URL = " + JSON.stringify(APP_PATH + "/api") + ";");
  res.type('html').send(html);
});

const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
if (APP_PATH) {
  app.use(APP_PATH, express.static(staticDir));
}

app.get(['/api/scores', APP_PATH + '/api/scores'].filter(Boolean), (req, res) => {
  try {
    if (!fs.existsSync(SCORES)) return res.json({});
    res.json(JSON.parse(fs.readFileSync(SCORES, 'utf8')));
  } catch (e) {
    res.status(500).json({ error: 'Could not read scores: ' + e.message });
  }
});

app.post(['/api/scores', APP_PATH + '/api/scores'].filter(Boolean), (req, res) => {
  try {
    fs.mkdirSync('/data', { recursive: true });
    fs.writeFileSync(SCORES, JSON.stringify(req.body, null, 2) + '\n', 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Could not write scores: ' + e.message });
  }
});

app.get(['/api/health', APP_PATH + '/api/health'].filter(Boolean), (req, res) => {
  res.json({ ok: true });
});

app.get(['/api/version', APP_PATH + '/api/version'].filter(Boolean), (req, res) => {
  res.json({ version: process.env.APP_VERSION || 'unknown' });
});

let updateCache = null;
let updateCacheTime = 0;
const UPDATE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

app.get(['/api/check-update', APP_PATH + '/api/check-update'].filter(Boolean), (req, res) => {
  const currentVersion = process.env.APP_VERSION || 'unknown';
  if (currentVersion === 'unknown') {
    return res.json({ updateAvailable: false, currentVersion });
  }
  const now = Date.now();
  if (updateCache && (now - updateCacheTime) < UPDATE_CACHE_TTL) {
    return res.json(updateCache);
  }
  const options = {
    hostname: 'api.github.com',
    path: '/repos/softwaresteph/wisdom-of-the-masses/releases/latest',
    headers: { 'User-Agent': 'wisdom-of-the-masses-server' }
  };
  https.get(options, (ghRes) => {
    let data = '';
    ghRes.on('data', chunk => { data += chunk; });
    ghRes.on('end', () => {
      try {
        const release = JSON.parse(data);
        const latestVersion = release.tag_name;
        const updateAvailable = latestVersion !== currentVersion;
        updateCache = {
          updateAvailable,
          currentVersion,
          latestVersion,
          releaseUrl: release.html_url
        };
        updateCacheTime = now;
        res.json(updateCache);
      } catch (e) {
        res.status(500).json({ error: 'Could not parse GitHub response: ' + e.message });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: 'Could not reach GitHub API: ' + e.message });
  });
});

let updateInProgress = false;

app.post(['/api/update', APP_PATH + '/api/update'].filter(Boolean), (req, res) => {
  if (updateInProgress) {
    return res.status(409).json({ error: 'Update already in progress' });
  }
  updateInProgress = true;

  const docker = new Docker({ socketPath: '/var/run/docker.sock' });

  docker.pull(IMAGE, (err, stream) => {
    if (err) {
      updateInProgress = false;
      return res.status(500).json({ error: 'Pull failed: ' + err.message });
    }
    docker.modem.followProgress(stream, (err) => {
      if (err) {
        updateInProgress = false;
        return res.status(500).json({ error: 'Pull failed: ' + err.message });
      }
      res.json({ ok: true, message: 'Image pulled. Restarting...' });
      setTimeout(() => process.exit(0), 200);
    });
  });
});

app.listen(PORT, () => console.log('Listening on port ' + PORT));
