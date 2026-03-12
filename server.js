'use strict';
const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app    = express();
const PORT   = process.env.PORT || 3000;
const SCORES = path.join('/data', 'scores.json');

app.use(express.json());

const HTML_FILE = fs.existsSync(path.join(__dirname, 'public', 'index.html'))
  ? path.join(__dirname, 'public', 'index.html')
  : path.join(__dirname, 'catfish-tracker.html');

app.get('/', (req, res) => {
  let html = fs.readFileSync(HTML_FILE, 'utf8');
  html = html.replace("const SERVER_URL = null;", "const SERVER_URL = '/api';");
  res.type('html').send(html);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/scores', (req, res) => {
  try {
    if (!fs.existsSync(SCORES)) return res.json({});
    res.json(JSON.parse(fs.readFileSync(SCORES, 'utf8')));
  } catch (e) {
    res.status(500).json({ error: 'Could not read scores: ' + e.message });
  }
});

app.post('/api/scores', (req, res) => {
  try {
    fs.mkdirSync('/data', { recursive: true });
    fs.writeFileSync(SCORES, JSON.stringify(req.body, null, 2) + '\n', 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Could not write scores: ' + e.message });
  }
});

app.listen(PORT, () => console.log('Listening on port ' + PORT));
