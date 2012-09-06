var pg = require('pg');

if(process.env.FRAMEWORK_ENV && process.env.FRAMEWORK_ENV == 'production') {
 var conString = "tcp://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST + "/" + process.env.APP_NAME;
}
else {
  var conString = "tcp://dev:dev@localhost/nodeblog";
}

//var db = new pg.Client(conString);
pg.connect(conString, function(err, db) {
  // Set up the initial schema
  db.query("ALTER TABLE posts ADD COLUMN created_at TIMESTAMP")
});