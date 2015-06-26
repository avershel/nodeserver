var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var redisClient;
var redisClient = redis.createClient(6379, process.env.PARAM1);
var bodyParser = require("body-parser");
var CookieParser = require('cookie-parser');
var SECRET = 'hellonihao';
var COOKIENAME = 'hello';
var cookieParser = CookieParser(SECRET);
var session = require('express-session');
var connectRedis = require('connect-redis');
var RedisStore = connectRedis(session);
var rClient = redis.createClient();
var sessionStore = new RedisStore({client: rClient});
var SessionSockets = require('session.socket.io');
var sessionSockets = new SessionSockets(io, sessionStore, cookieParser, 'jsessionid');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(session({
  store: sessionStore,
  secret: SECRET,
  resave: true,
  saveUninitialized: true
}))
var path = require('path');
var term = '';

app.get('/', function(req, res){
console.log('about to serve index.html');
  // res.sendFile('index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
console.log('serving index.html');
});

app.get('/socket.io.js', function(req, res){
  res.sendFile(path.join(__dirname, 'socket.io.js'));
});
var vas = 'vasjs.min.js';
app.get('/can' + vas, function(req, res){
  res.sendFile(path.join(__dirname, 'canvasjs.min.js'));
});

app.get('/main.js', function(req, res){
  res.sendFile(path.join(__dirname, 'main.js'));
});

// log that we have subscribed to a channel
redisClient.on('subscribe', function(channel, count) {
	console.log('redis client subscribed');
});

// // When we get a message from redis, we send the message down the socket to the client
// redisClient.on('message', function(channel, message) {
//   // console.log('got message');
//
//   var twit = JSON.parse(message);
//
//   if (term == null || term.length == 0) {
//     io.emit('tweet', twit);
//
//   }
//   else {
//     if (twit.text) {
//
//
//       var twittext = twit.text;
//       // console.log(x);
//       if (twittext.indexOf(term) > -1) {
//         io.emit('tweet', twit);
//
//       }
//
//     }
//   }
// });

// subscribe to listen to events from redis
redisClient.on("ready", function () {
  console.log('redis ready');
	redisClient.subscribe("loc");
});

io.on('connection', function(socket) {
    console.info('New client connected (id=' + socket.id + ').');
    // console.log(socket);
    if (socket.id) {
      //rf = redis.fetch)cookie_info()
      if (socket.id == 'hold=over') {
        // if (rf)

        //term = rf.term;
        //send filtered set
      }
      else {
        //redis.setcookie(socket.id)
        // When we get a message from redis, we send the message down the socket to the client
        redisClient.on('message', function(channel, message) {
          // console.log('got message');

          var twit = JSON.parse(message);

            io.emit('tweet', twit);


        });
      }
    }

});

http.listen(process.env.PORT || 3000, function(){
  if (process.env.PORT)
  console.log('PORT = ' +process.env.PORT);
  else
  console.log('listening on 3000');
});


app.post('/query', function(req, res) {
  console.log('posted');
  console.log(req);
  // console.log(req.body.firstname);
  if(!req.body.hasOwnProperty('firstname')) {
  res.statusCode = 400;
  return res.send('Error 400: Post syntax incorrect.');
}
term = req.body.firstname;
req.session.term = req.body.firstname;
console.log('req.session.term = ' + req.session);
console.log(term);
res.sendFile(path.join(__dirname, 'index.html'));

});


sessionSockets.on('connection', function (err, socket, session) {
  //your regular socket.io code goes here
  //and you can still use your io object
  console.log('session socket connection');
  session.term = 'the';
  console.log(session);
  console.log(session.term);
});


// passing the session store and cookieParser
app.sessionStore = sessionStore;
app.cookieParser = cookieParser;
