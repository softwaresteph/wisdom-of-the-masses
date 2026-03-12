'use strict';
const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app      = express();
const PORT       = process.env.PORT || 3000;
const DATA_DIR   = process.env.DATA_DIR || '/data';
const SERVER_URL = process.env.SERVER_URL || '/api';
const SCORES     = path.join(DATA_DIR, 'scores.json');

app.use(express.json());

// Serve HTML with SERVER_URL auto-injected
app.get('/', (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  html = html.replace("const SERVER_URL = null;", `const SERVER_URL = '${SERVER_URL}';`);
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
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SCORES, JSON.stringify(req.body, null, 2) + '\n', 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Could not write scores: ' + e.message });
  }
});

app.listen(PORT, () => console.log('Listening on port ' + PORT));
