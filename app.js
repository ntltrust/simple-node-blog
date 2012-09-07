// Set up application modules
var sys = require('sys');
var express = require('express');
var app = express();
var uuid = require('node-uuid')
var util = require('util');
var moment = require('moment');

// Set some basic view settings for Express.
// Taken from https://github.com/visionmedia/express/blob/master/examples/ejs/index.js
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.bodyParser());
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));

// Set up the database connection
var pg = require('pg');

// Figure out whether or not we're running in production or development mode and construct the connection string as needed.
if(process.env.FRAMEWORK_ENV && process.env.FRAMEWORK_ENV == 'production') {
 var conString = "tcp://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST + "/" + process.env.APP_NAME;
}
else {
  var conString = "tcp://dev:dev@localhost/nodeblog";
}

// Set the pg client variable and connect to the database
var client = new pg.Client(conString);
client.connect();

/* APPLICATION FUNCTIONALITY ENTRY POINT */
/* ===================================== */


/* INDEX
      METHOD:   GET
      ROUTE:    /
      PARAMS:   None
      PURPOSE:  Displays a form to create a new post,
                and lists existing posts for perusal. */
// -------------------------------------------------- //
app.get('/', function(req, res) {
  // Get all the existing posts out of the database.
  // Note that in a real app, you'd want this paginated, but for demo purposes this works.
  var query = client.query("SELECT * FROM posts ORDER BY created_at DESC");
  query.on('row', function(row, result) {
    result.addRow(row);
  });

  query.on('end', function(result) {
    res.render('posts', { posts: result.rows });
  });
});





/* POST VIEW
      METHOD:   GET
      ROUTE:    /posts/:uuid
      PARAMS:   UUID specified in URI
      PURPOSE:  Displays the post specified by UUID.  */
// -------------------------------------------------- //
app.get('/posts/:guid', function(req, res) {
  var query = client.query("SELECT * FROM posts WHERE id = $1 LIMIT 1", [req.params.guid])
  query.on('row', function(row, result) {
    result.addRow(row);
  });
  query.on('end', function(result) {
    res.render('post', { post: result.rows[0] });
  });
});





/* POST CREATION
      METHOD:   POST
      ROUTE:    /
      PARAMS:   author_email, title, body
      PURPOSE:  Creates a post object.                 */
// -------------------------------------------------- //
app.post('/', function(req, res) {
  var author_email = req.body.author_email;
  var title = req.body.title;
  var body = req.body.body;
  var guid = uuid.v4();
  var creation_date = moment().utc().format("YYYY-MM-DD HH:mm:ss");

  var query = client.query({
    name: 'create new post',
    text: "INSERT INTO posts (id, author_email, body, title, created_at) VALUES ($1, $2, $3, $4, $5)",
    values: [guid, author_email, body, title, creation_date]
  });

  query.on('end', function() {
    res.redirect('/');
  });
});





// What port should we be listening on?
port = process.env.PORT || 3000;
app.listen(port);