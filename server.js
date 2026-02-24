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
    CREATE TABLE IF NOT EXISTS aircraft (
      id TEXT PRIMARY KEY,
name TEXT,
country TEXT,
manufacturer TEXT,
first_flight INTEGER,
role TEXT,

engine_count INTEGER,
intake_count INTEGER,
vertical_stabilizers INTEGER,
has_canards INTEGER,
wing_type TEXT,
stealth INTEGER,

max_speed REAL,
combat_range INTEGER,
length REAL,
wingspan REAL,
height REAL,
weapons TEXT
      
    )
  `);

  db.run(`
  INSERT OR IGNORE INTO aircraft VALUES

('f22','F-22 Raptor','USA','Lockheed Martin',1997,'Air Superiority',
2,2,2,0,'trapezoidal',1,
2.25,2960,18.9,13.6,5.1,
'AIM-120 AMRAAM; AIM-9 Sidewinder; M61A2 20mm cannon'),

('f35','F-35 Lightning II','USA','Lockheed Martin',2006,'Multirole',
1,2,2,0,'trapezoidal',1,
1.6,2200,15.7,10.7,4.4,
'AIM-120 AMRAAM; AIM-9X; GAU-22/A 25mm cannon'),

('su57','Su-57','Russia','Sukhoi',2010,'Multirole Fighter',
2,2,2,0,'blended',1,
2.0,3500,20.1,14.1,4.6,
'R-77; R-74; 30mm cannon'),

('j20','Chengdu J-20','China','Chengdu Aerospace',2011,'Stealth Fighter',
2,2,2,0,'delta',1,
2.0,3400,20.4,13.5,4.5,
'PL-15; PL-10; 30mm cannon'),

('rafale','Dassault Rafale','France','Dassault Aviation',1986,'Multirole',
2,2,1,1,'delta',0,
1.8,3700,15.3,10.9,5.3,
'MICA; Meteor; 30mm cannon')
`);
    
 
});

// Matching endpoint
app.post('/match', (req, res) => {
  const filters = req.body;app.get('/search', (req, res) => {
  const name = req.query.name;

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
