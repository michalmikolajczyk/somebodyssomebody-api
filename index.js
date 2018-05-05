const express = require('express');
const app = express();
var join = require('path').join
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');
var helmet = require('helmet');
var sqlite3 = require('sqlite3').verbose();

/**
 * DATABASE INIT
 */

var db = new sqlite3.Database(join(__dirname, 'sqlitedb'));

const somebody = `(
  name TEXT,
  PRIMARY KEY(name)
)`;

db.serialize(function() {
  db.run(`CREATE TABLE IF NOT EXISTS somebodys ${somebody}`);
});

/**
 * MIDDLEWARE
 */

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(helmet({
  hsts: false,
  noSniff: false
}));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);

  if (process.env.NODE_ENV !== 'production') {
    res.setHeader('X-Robots-Tag', "noindex, nofollow");
  }
  next();
});

/**
 * ROUTES
 */

// app.use('/', express.static(join(__dirname, '../public_static')));

app.get('/somebody', function(req, res, next) {
  return db.get(`SELECT * FROM somebodys ORDER BY RANDOM() LIMIT 1;`, function (e, result) {
    if (e) {
      console.log(e);
      return res.send(e);
    }
    return res.send(result);
  });
});

app.post('/somebody', function(req, res, next) {
  if (typeof req.body.name === 'string') {
    const data = { $name: req.body.name };
    return db.run(`
      INSERT OR IGNORE INTO somebodys(
        name
      ) VALUES (
        $name
      )`, data, function (e) {
      if (e) {
        console.log(e);
        return res.send(e);
      }
      return res.send({ success: true });
    });
  }
  console.log(req.body)
  return res.send({ success: false });
});

app.get('/robots.txt', function(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    res.end();
  } else {
    next();
  }
});

app.listen(port, () => {
  console.log("Somebody is listening at http://127.0.0.1:" + port);
});
