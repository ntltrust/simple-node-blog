var sys = require('sys');
var express = require('express');
var app = express();

// Set some basic view settings for Express.
// Taken from https://github.com/visionmedia/express/blob/master/examples/ejs/index.js
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// Index - shows posts and has a form to create a new one
app.get('/', function(req, res) {
  var pg = require('pg').native;

  if(process.env.FRAMEWORK_ENV && process.env.FRAMEWORK_ENV == 'production') {
   var conString = "tcp://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST + "/" + process.env.APP_NAME;
  }
  else {
    var conString = "tcp://dev:dev@localhost/nodeblog";
  }

  // Define the "after" callback for use with the pg module
  // var after = function(callback) {
  //   return function(err, queryResult) {
  //     if(err) {
  //       res.writeHead(500, {"Content-Type" : "text/plain"});
  //       return res.end("Error! " + sys.inspect(err))
  //     }
  //     callback(queryResult)
  //   }
  // }

  // pg.connect(conString, after(function(client) {
  //   client.query("SELECT * FROM posts", after(function(result) {
  //     res.render('posts', { posts: result });
  //   }))
  // }))


  pg.connect(conString, function(err, client) {
    client.query('SELECT * FROM posts', function(err, result) {
      console.log(result);
      res.render('posts', { posts: result.rows });
    })
  });

});

app.listen(3000);