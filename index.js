// # SimpleServer
// A simple chat bot server

var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);

app.listen(process.env.PORT || 3000);

app.get('/', (req, res) => {
  res.send("Server ch?y ngon lành.");
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'bippi') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});


function callSendAPI(sender_psid, response) {
	let request_body = {
		"recipient": {
			"id": sender_psid
		},
		"message": response
	}
	request ({
		"url": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": "EAARTS83dsCABAP32JJhyMwpsgynZCpNgTwZAD5EhG9KI9BPoQcguR1zGQiAfqoZBibAH4xx50ZAVGIoPMMBSU9JcFcpTUi5WxZBkQ8kcPLyPc0MeoalVIZBVLDIQVAOpA3WfMbkq60Lg1u9xXLkw86eHN9gMFrTfItbZAHb7Gky3QSVch6ikzeh" },
		"method": "POST",
		"json": request_body
	});
}

function handleMessage(sender_psid, received_message) {
	let response;
	
	if (received_message.text) {
		response = {
			"text": 'Xin chao!'
		}
	} 
	callSendAPI(sender_psid, response);
}
app.post('/webhook', function(req, res) {
	var entries = req.body.entry;
	for (var entry of entries) {
		var messaging = entry.messaging;
		for (var message of messaging) {
			var senderId = message.sender.id;
			if (message.message) {
				handleMessage(senderId, message.message);
			}
		}
	}
	res.status(200).send("OK");
});

