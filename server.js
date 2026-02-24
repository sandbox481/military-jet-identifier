const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./aircraft.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to aircraft database.');
  }
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

// Serve static files (website)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
