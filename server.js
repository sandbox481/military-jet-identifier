const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Create / Open Database
const db = new sqlite3.Database('./aircraft.db');

db.serialize(() => {
  db.run(`
db.run(`
  CREATE TABLE IF NOT EXISTS aircraft (
    id TEXT PRIMARY KEY,
    name TEXT,
    country TEXT,
    engine_count INTEGER,
    intake_count INTEGER,
    vertical_stabilizers INTEGER,
    has_canards INTEGER,
    wing_type TEXT,
    stealth INTEGER,
    guns INTEGER,
    bvr_capable INTEGER,
    guided_bombs INTEGER,
    internal_weapons_bay INTEGER,
    heavy_ground_attack INTEGER
  )
`);
  );

  db.run(`INSERT OR IGNORE INTO aircraft VALUES
    ('f22','F-22 Raptor','USA',2,2,2,0,'blended_stealth',1),
    ('su57','Sukhoi Su-57','Russia',2,2,2,0,'blended_stealth',1),
    ('j20','Chengdu J-20','China',2,2,2,1,'delta',1),
    ('rafale','Dassault Rafale','France',2,2,1,1,'delta',0),
    ('typhoon','Eurofighter Typhoon','UK',2,2,1,1,'delta',0)
  `);
});

// Matching endpoint
app.post('/match', (req, res) => {
  const filters = req.body;

  const query = `
    SELECT *,
    (
      (engine_count = ?) * 20 +
      (intake_count = ?) * 15 +
      (vertical_stabilizers = ?) * 20 +
      (has_canards = ?) * 15 +
      (wing_type = ?) * 10 +
      (stealth = ?) * 10
    ) AS score
    FROM aircraft
    ORDER BY score DESC
    LIMIT 3
  `;

  const values = [
    filters.engine_count,
    filters.intake_count,
    filters.vertical_stabilizers,
    filters.has_canards,
    filters.wing_type,
    filters.stealth
  ];

  db.all(query, values, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
