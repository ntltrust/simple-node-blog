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

var pg = require('pg').native;

if(process.env.FRAMEWORK_ENV && process.env.FRAMEWORK_ENV == 'production') {
 var conString = "tcp://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST + "/" + process.env.APP_NAME;
}
else {
  var conString = "tcp://dev:dev@localhost/nodeblog";
}

// For reading a blog post
app.get('/posts/:guid', function(req, res) {
  pg.connect(conString, function(err, client) {
    client.query("SELECT * FROM posts WHERE id = '" + req.params.guid + "' LIMIT 1", function(err, result) {
      console.log(result);
      res.render('post', { post: result.rows[0] });
    })
  });
});

// For creating a new blog post.
app.post('/', function(req, res) {
  var author_email = req.body.author_email;
  var title = req.body.title;
  var body = req.body.body;
  var guid = uuid.v4();

  pg.connect(conString, function(err, client) {
    var creation_date = moment().utc().format("YYYY-MM-DD HH:mm:ss");
    var q = util.format("INSERT INTO posts (id, author_email, body, title, created_at) VALUES ('%s', '%s', '%s', '%s', '%s')", guid, author_email, body, title, creation_date);
    console.log(q);
    client.query(q, function(err, result) {
      console.log(result);
    })
  });

  res.redirect('/');
});

// Index - shows posts and has a form to create a new one
app.get('/', function(req, res) {

  pg.connect(conString, function(err, client) {
    client.query('SELECT * FROM posts ORDER BY created_at DESC', function(err, result) {
      res.render('posts', { posts: result.rows });
    })
  });

});

// What port should we be listening on?
port = process.env.PORT || 3000;
app.listen(port);