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

var cors = require('cors');
var jsonObj = require("./country.json");

app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(cors());
app.use(session({
  store: sessionStore,
  secret: SECRET,
  resave: true,
  saveUninitialized: true
}));
var path = require('path');
// var $ = require('jquery');
var term = '';
var tweets = [];
var ids = [];
var terms = [];
var alltweets = [];
var current;
var countrycodes = [];
var checktweet;

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


//Streams

//Real-time Stream
app.get('/tweets/realtime', function(req, res) {

  if(current && current !== null){
    res.json(current);
    current = null;
  }
  else {
    res.json('no current');
  }

});

//Realtime stream w/ keyword query
app.get('/tweets/realtime/query/:id', function(req, res) {
  if(current){
    var tweetholder = current;
    var parsedTweet = JSON.parse(tweetholder);
    if(parsedTweet.text)
    {
      var tweettext = parsedTweet.text;
      var x = req.params.id;
      var y = x.toString();
      if (tweettext.indexOf(y) > -1) {
        res.json(tweetholder);

      }
      else {
        res.json('string not in text');
      }

    }
    else {
      res.json('no text');
    }
  }
  else {
    res.json('no current');
  }
});



app.get('/tweets/realtime/country/:id', function(req, res) {
  if (current) {
    var tweetholder = current;
    var parsedTweet = JSON.parse(tweetholder);

    if(parsedTweet.place)
    {
      var plc = parsedTweet.place;

      if(plc.country_code && plc.country){

        var x = req.params.id;
        var paramcountry = x.toString();
        var tweetcountrycode = plc.country_code;
        var paramcountrycode;

        paramcountry = paramcountry.replace(/\s+/g, '');
        paramcountry = paramcountry.toUpperCase();


        for (var i = 0; i < jsonObj.length; i++) {
          if(jsonObj[i].countrycaps == paramcountry)
          {
            paramcountrycode = jsonObj[i].ccode;
            break;
          }
        }
        if (tweetcountrycode == paramcountrycode) {
          res.json(tweetholder);

        }
        else {
          res.json('wrong country code');
        }

      }
      else {
        res.json('no country && code');
      }

    }
    else {
      res.json('no place');
    }
  }
  else {
    res.json('no current');
  }

});

//dont forget to change turkey!!! TÃœRKIYE
app.get('/tweets/realtime/query/:id/country/:cntry', function(req, res) {
  if (current) {
    var tweetholder = current;
    var x = req.params.id;
    var y = x.toString();
    var parsedTweet = JSON.parse(tweetholder);

    if(parsedTweet.text)
    {
      var tweettext = parsedTweet.text;
      if (tweettext.indexOf(y) > -1) {
        if(parsedTweet.place)
        {
          var plc = parsedTweet.place;
          if(plc.country_code && plc.country){
            var pc = req.params.cntry;
            var paramcountry = pc.toString();
            var tweetcountrycode = plc.country_code;
            var paramcountrycode;

            paramcountry = paramcountry.replace(/\s+/g, '');
            paramcountry = paramcountry.toUpperCase();

            for (var i = 0; i < jsonObj.length; i++) {
              if(jsonObj[i].countrycaps == paramcountry)
              {
                paramcountrycode = jsonObj[i].ccode;
                break;
              }
            }
            if (tweetcountrycode == paramcountrycode) {
              res.json(tweetholder);

            }
            else {
              res.json('wrong country code');
            }

          }
          else {
            res.json('no country && code');
          }

        }
        else {
          res.json('no place');
        }
      }
      else {
        res.json('string not in text');
      }
    }
    else {
      res.json('no text');
    }
  }
  else {
    res.json('no current');
  }
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
          // alltweets.push(message);

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
