
// window.onload = function () {
var socket = io();

var holder = [];
var xVal = 0;
var yVal = 0;
var updateInterval = 5000;
var dataLength = 60; // number of dataPoints visible at any point
// console.log('here');
var term;
// console.log('here');
socket.on('foo', function(msg) {
		// console.info(msg);
		// console.log('here');

		// console.log(msg.length);
		// yVal = msg.length;
		 d = new Date();
		 l0 = d.getHours();
		l1 = d.getMinutes();
		l2 = d.getSeconds();
    // xVal = String(l0 + ':' + l1 + ":" + l2);
		// console.log(xVal);
		// updateChart();
		// len = 0;

});
socket.on('tweet', function(msg) {
  // if (msg.text) {
  //   var a = msg.text;
  //   if (term == null || term.length == 0) {
  //     holder.push(msg);
  //
  //   }
  //   else {
  //     // var x = msg[text];
  //     // console.log(x);
  //       if (a.indexOf(term) > -1) {
  //         console.log(a);
  //         holder.push(msg);
  //
  //       }
  //
  //
  //   }
  // }
  holder.push(msg);
  // console.log(msg);


});


function updateterm()
{
  console.log('updating term');
  term=document.getElementById("tf").value;
  console.log('term = ' + term);
  socket.emit('join', JSON.stringify({}));

}
var dps = []; // dataPoints

var chart = new CanvasJS.Chart("chartContainer",{
	title :{
		text: "NOLO Twitter Stream"
	},
	axisX:{
		title: "Seconds"
	// valueFormatString: "DD-MMM" ,
	// interval: 10,
	// intervalType: "day",
	// labelAngle: -50,
	// labelFontColor: "rgb(0,75,141)",
	// minimum: new Date(2012,06,10)
},
axisY: {
	title: "Tweets per second",
	// interlacedColor: "azure",
	// tickColor: "azure",
	// titleFontColor: "rgb(0,75,141)",
	// valueFormatString: "#M,,.",
	// interval: 100000000
},
	data: [{
		type: "line",
		dataPoints: dps
	}]
});


var updateChart = function () {
	for (var i = 0; i < dps.length; i++) {
		dps[i].x -=1;
	}
		dps.push({
			x: 0 ,
			y: yVal
		});

	if (dps.length > dataLength)
	{
		dps.shift();
	}

	chart.render();
};

// generates first set of dataPoints
updateChart();

setInterval(function() {
  yVal = holder.length;
	updateChart();
  console.log(holder.length);
  holder = [];
}, 1000);



/*
 Connect to socket.io on the server.
 */
// var host = window.location.host//.split(':')[0];
// var socket = io.connect('http://' + host, {reconnect:false, 'try multiple transports':false});
// var intervalID;
// var reconnectCount = 0;


//
// $.post('/user', {"user":name})
//     .success(function () {
//         // send join message
//         socket.emit('join', JSON.stringify({}));
//     }).error(function () {
//         console.log("error");
//     });
