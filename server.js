require('log-timestamp');
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
var rClient = redis.createClient(6379, process.env.PARAM2);
var sessionStore = new RedisStore({client: rClient});
// var ip = require('ip');
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(session({
  store: sessionStore,
  secret: SECRET,
  resave: true,
  saveUninitialized: true
}));
var path = require('path');
var term = '';
var tweets = [];
var ids = [];
var terms = [];

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



// subscribe to listen to events from redis
redisClient.on("ready", function () {
  console.log('redis ready');
	redisClient.subscribe("loc");
});

rClient.get('user_info', function(err, reply){
  if (reply) {
    ids = JSON.parse(reply);
  }
});


redisClient.on('message', function(channel, message) {
  // console.log(message.text);
  if (ids.length > 0) {

    for (var i = 0; i < ids.length; i++) {

      if (ids.term != '') {
        var parsedTweet = JSON.parse(message);

        if (parsedTweet.text) {
          var tweetText = parsedTweet.text;

          if (tweetText.indexOf(ids[i].term) > -1) {
            io.to(ids[i].id).emit('foo', message);

          }
        }
      }
      else {
        io.to(ids[i].id).emit('foo', message);

      }
    }
  }
});



io.on('connection', function(socket) {
  // console.log('server running on IP address... = ' + ip.address());
  console.info('New client connected (id=' + socket.id + ').');
  ids.push({id:socket.id, term:''})
  rClient.set('user_info', JSON.stringify(ids));
  socket.on('term', function(msg) {
    for (var i = 0; i < ids.length; i++) {
      if(ids[i].id == socket.id)
      {
        ids[i].term = msg;
        rClient.set('user_info', JSON.stringify(ids));
        break;
      }
    }
  });
});

http.listen(process.env.PORT || 3000, function(){
  if (process.env.PORT)
  console.log('PORT = ' +process.env.PORT);
  else
  console.log('listening on 3000');
});
// passing the session store and cookieParser
app.sessionStore = sessionStore;
app.cookieParser = cookieParser;
