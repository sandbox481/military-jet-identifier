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
weapons,TEXT
      
    )
  `);

  db.run(`
  INSERT OR IGNORE INTO aircraft VALUES

  -- USA
  ('f4','F-4 Phantom II','USA',2,2,1,0,'swept',0),
  ('f14','F-14 Tomcat','USA',2,2,2,0,'variable',0),
  ('f15','F-15 Eagle','USA',2,2,2,0,'swept',0),
  ('f16','F-16 Fighting Falcon','USA',1,1,1,0,'blended',0),
  ('f18','F/A-18 Hornet','USA',2,2,2,0,'blended',0),
  ('f22','F-22 Raptor','USA',2,2,2,0,'blended_stealth',1),
  ('f35','F-35 Lightning II','USA',1,1,2,0,'blended_stealth',1),

  -- Russia / USSR
  ('mig21','MiG-21','USSR',1,1,1,0,'delta',0),
  ('mig29','MiG-29','Russia',2,2,2,0,'blended',0),
  ('su27','Su-27 Flanker','Russia',2,2,2,0,'blended',0),
  ('su35','Su-35','Russia',2,2,2,0,'blended',0),
  ('su57','Sukhoi Su-57','Russia',2,2,2,0,'blended_stealth',1),

  -- China
  ('j7','Chengdu J-7','China',1,1,1,0,'delta',0),
  ('j10','Chengdu J-10','China',1,1,1,1,'delta',0),
  ('j11','Shenyang J-11','China',2,2,2,0,'blended',0),
  ('j20','Chengdu J-20','China',2,2,2,1,'delta',1),

  -- UK
  ('lightning','English Electric Lightning','UK',2,2,1,0,'swept',0),
  ('harrier','Harrier','UK',1,2,1,0,'high',0),
  ('typhoon','Eurofighter Typhoon','UK',2,2,1,1,'delta',0),

  -- France
  ('mirage3','Mirage III','France',1,1,1,0,'delta',0),
  ('mirage2000','Mirage 2000','France',1,1,1,0,'delta',0),
  ('rafale','Dassault Rafale','France',2,2,1,1,'delta',0),

  -- Sweden
  ('draken','Saab 35 Draken','Sweden',1,2,1,0,'double_delta',0),
  ('viggen','Saab 37 Viggen','Sweden',1,1,1,0,'delta',0),
  ('gripen','Saab JAS 39 Gripen','Sweden',1,1,1,1,'delta',0),

  -- Germany
  ('tornado','Panavia Tornado','Germany',2,2,2,0,'variable',0),

  -- Japan
  ('f2','Mitsubishi F-2','Japan',1,1,1,0,'blended',0),

  -- India
  ('tejas','HAL Tejas','India',1,1,1,0,'delta',0),

  -- Israel
  ('kfir','IAI Kfir','Israel',1,1,1,1,'delta',0),

  -- Pakistan
  ('jf17','JF-17 Thunder','Pakistan',1,1,1,0,'blended',0)
`);
    
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
