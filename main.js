var socket = io.connect('http://nolo-tr.elasticbeanstalk.com');
// var socket = io();
var holder = [];
var xVal = 0;
var yVal = 0;
var updateInterval = 5000;
var dataLength = 60; // number of dataPoints visible at any point




socket.on('foo', function(msg) {
  holder.push(msg);
});




function updateterm()
{
  console.log('updating term');
  var term=document.getElementById("tf").value;
  console.log('term = ' + term);
  holder = [];
  socket.emit('term', term);

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
