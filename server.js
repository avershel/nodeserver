//dependencies
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
var alltweets = [];
var current;

//http requests
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/socket.io.js', function(req, res){
  res.sendFile(path.join(__dirname, 'socket.io.js'));
});
app.get('/canvasjs.min.js', function(req, res){
  res.sendFile(path.join(__dirname, 'canvasjs.min.js'));
});
app.get('/main.js', function(req, res){
  res.sendFile(path.join(__dirname, 'main.js'));
});

app.get('/tweets', function(req, res) {
  res.json(alltweets);
});

app.get('/tweets/text', function(req, res) {
  var holder = [];
  for (var i = 0; i < alltweets.length; i++) {
    var parsedTweet = JSON.parse(alltweets[i]);
    if(parsedTweet.text)
    {
      holder.push(parsedTweet.text);

    }
  }
  res.json(holder);
});

app.get('/tweets/current', function(req, res) {
  //DELETE THE NEXT LINEs
  var twit = alltweets[alltweets.length -1];
  var parsedTweet = JSON.parse(twit);
  // var keys = Object.keys(parsedTweet);
  res.json(parsedTweet);
  // res.json(keys);
});

app.get('/tweets/current/keys', function(req, res) {
  //DELETE THE NEXT LINEs
  var twit = alltweets[alltweets.length -1];
  var parsedTweet = JSON.parse(twit);
  var keys = Object.keys(parsedTweet);
  // res.json(parsedTweet);
  res.send(keys);
});

app.get('/tweets/index/:id', function(req, res) {
  res.json(alltweets[req.params.id]);

});
app.get('/tweets/query/:id', function(req, res) {
  var holder = [];
  var x = req.params.id;
  var y = x.toString();
  for (var i = 0; i < alltweets.length; i++) {
    var parsedTweet = JSON.parse(alltweets[i]);
    if(parsedTweet.text)
    {
      var tweettext = parsedTweet.text;
      if (tweettext.indexOf(y) > -1) {
        holder.push(alltweets[i]);
      }
    }
  }
  res.json(holder);
});

app.get('/tweets/query/:id/country/:cntry', function(req, res) {
  var holder = [];
  var x = req.params.id;
  var y = x.toString();
  for (var i = 0; i < alltweets.length; i++) {
    var parsedTweet = JSON.parse(alltweets[i]);
    if(parsedTweet.text)
    {
      var tweettext = parsedTweet.text;
      if (tweettext.indexOf(y) > -1) {
        if(parsedTweet.place){
          var plc = parsedTweet.place;
          if(plc.country){
            var tweetcountry = plc.country;

            // var tweetcountry = JSON.stringify(jsontweetcountry);
            tweetcountry = tweetcountry.replace(/\s+/g, '');
            tweetcountry = tweetcountry.replace(/"/g,"");

            var paramcountry = req.params.cntry;
            paramcountry = paramcountry.replace(/\s+/g, '');
            paramcountry = paramcountry.toUpperCase();
            tweetcountry = tweetcountry.toUpperCase();
            console.log(tweetcountry + ' ' + paramcountry);
            if (tweetcountry == paramcountry) {
              holder.push(alltweets[i]);

            }
          }
        }
      }
    }
  }
  res.json(holder);
});
app.get('/tweets/query/:id/countrycode/:ccode', function(req, res) {
  var holder = [];
  var x = req.params.id;
  var y = x.toString();
  for (var i = 0; i < alltweets.length; i++) {
    var parsedTweet = JSON.parse(alltweets[i]);
    if(parsedTweet.text)
    {
      var tweettext = parsedTweet.text;
      if (tweettext.indexOf(y) > -1) {
        if(parsedTweet.place){
          var plc = parsedTweet.place;
          if(plc.country_code){
            var tweetcountry = plc.country_code;

            // var tweetcountry = JSON.stringify(jsontweetcountry);
            tweetcountry = tweetcountry.replace(/\s+/g, '');
            tweetcountry = tweetcountry.replace(/"/g,"");

            var paramcountry = req.params.ccode;
            paramcountry = paramcountry.replace(/\s+/g, '');
            paramcountry = paramcountry.toUpperCase();
            tweetcountry = tweetcountry.toUpperCase();
            console.log(tweetcountry + ' ' + paramcountry);
            if (tweetcountry == paramcountry) {
              holder.push(alltweets[i]);

            }
          }
        }
      }
    }
  }
  res.json(holder);
});

app.get('/tweets/geo', function(req, res) {
  var holder = [];
  for (var i = 0; i < alltweets.length; i++) {
    var parsedTweet = JSON.parse(alltweets[i]);
    if(parsedTweet.place)
    {
      holder.push(parsedTweet.place);

    }
  }
  res.json(holder);
});

app.get('/tweets/geo/coordinates', function(req, res) {
  var holder = [];
  for (var i = 0; i < alltweets.length; i++) {
    var parsedTweet = JSON.parse(alltweets[i]);
    if(parsedTweet.place)
    {
      var x = parsedTweet.place;
      if (x.bounding_box) {
        var y = x.bounding_box;
        if(y.coordinates)
        {
          holder.push(y.coordinates);
        }
      }

    }
  }
  res.json(holder);
});
app.get('/tweets/geo/country', function(req, res) {
  var holder = [];
  for (var i = 0; i < alltweets.length; i++) {
    var parsedTweet = JSON.parse(alltweets[i]);
    if(parsedTweet.place)
    {
      var x = parsedTweet.place;
      if (x.country) {


        holder.push(x.country);
      }
    }
  }
  res.json(holder);
});






//Redis
redisClient.on('subscribe', function(channel, count) {
  // log that we have subscribed to a channel
  console.log('redis client subscribed');
});

redisClient.on("ready", function () {
  // subscribe to listen to events from redis
  redisClient.subscribe("loc");
});

rClient.on('user_info', function(err, reply){
  //update user and state info
  if (reply) {
    ids = JSON.parse(reply);
  }
});

redisClient.on('message', function(channel, message) {
  //When message recieved from db, send to each client if it contains their query term
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; i++) {
      if (ids.term != '') {
        var parsedTweet = JSON.parse(message);
        //if the tweet contains text
        if (parsedTweet.text) {
          //update var current and var alltweets[] for api
          current = message;
          alltweets.push(message);

          var tweetText = parsedTweet.text;

          if (tweetText.indexOf(ids[i].term) > -1) {
            //send tweet to client
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


//Socket.io
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

//server listen
http.listen(process.env.PORT || 3000, function(){
  if (process.env.PORT)
  console.log('PORT = ' +process.env.PORT);
  else
  console.log('listening on 3000');
});
