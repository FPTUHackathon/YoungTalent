// # SimpleServer
// A simple chat bot server

var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var router = express();
var storage = require('node-persist');

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

storage.initSync({dir: "senders"});

// thieu
function getAllSenders() {
	var senders = storage.getItemSync('senders');
	if (typeof senders === "undefined") return [];
	return senders;
}

// tim khach hang
function searchSender(senderId) {
	var senders = getAllSenders();
	var res = -1;
	for (var i = 0; i < senders.length; ++i) {
		if (senders[i].id === senderId) {
			res = i;
			break;
		}
	}
	return res;
}
function addSender(senderId, step) {
	var senders = getAllSenders();
	senders.push({
		id: senderId,
		step: step
	});
	storage.setItemSync('senders', senders);
}
function removeSender(i) {
	var senders = getAllSenders();
	senders.splice(i, 1);
	storage.setItemSync('senders', senders);
}

// cong's edit
function editSender(i, s) {
	var students = getAllSenders();
	for (var j=0; j<students.length; j++) 
	if (students[j].id = i){
		students[j].step = s;
	}
}
/*
function editSender(i, step) {
	var senders = getAllSenders();
	senders[i].step = step;
	storage.setItemSync('senders', senders);
}
*/

function callSendAPI(senderId, response) {
	let request_body = {
		"recipient": {
			"id": senderId
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

function helloCheck(text) {
	var hello = ["hi", "hello", "chao", "chào" ]
	var hi = text.toLowerCase();
	for (var i=0; i<4; ++i) {
		if ((hello[i].search(hi)) >= 0) return true;
	}
	return false;
}



function sendCost(senderId) {
	var response = {
		"text": 'Chọn số tiền cho suất cơm của bạn',
		"quick_reply": [
		{
			"content_type": "text",
			"title": "15k",
			"payload": "abc"
		}
		]
	}
}

function handleMessage(senderId, received_message) {
	let response;
	
	if (received_message.text) {
		var text = received_message.text;
		if (helloCheck(text)) 
			{
				response = {"text": 'Chào bạn, tôi là bippi, tôi sẽ rất vui nếu giúp được bạn ^_^!'}
			}
	} 
	callSendAPI(senderId, response);
}

function handleMessage1(senderId, received_message) {
	let response;
	response = {"text": 'Ten ban la gi?'}
	callSendAPI(senderId, response);	
	
	// hay xu ly received_message
}
function handleMessage2(senderId, received_message) {
	let respense;
	respense = {"text": 'Bạn muốn mua bao nhiêu xuất cơm'}
	callSendAPI(senderId, response);	
}
function handleMessage3(senderId, received_message) {
	let respense;
	respense = {"text": 'This is ques 3'}
	callSendAPI(senderId, response);		
}
// ten ban la gi?
// ban muon mua bao nhieu suat com?
// ban muon mua loai bao nhieu tien?
// so dien thoai cua ban la gi?
// cho minh xin dia chi cua ban?
app.post('/webhook', function(req, res) {
	var entries = req.body.entry;
	for (var entry of entries) {
		var messaging = entry.messaging;
		for (var message of messaging) {
			var senderId = message.sender.id;
			var senderStep = searchSender(senderId);
			// neu chua co
			if (senderStep === -1) {addSender(senderId , 0); senderStep = 0}
			// neu da co
			else 
			if (message.message) {
				switch (senderStep) {
					case 0 : {
						handleMessage(senderId, message.message);
						break;
					}
					case 1 : {
						handleMessage1(senderId, message.message);
						break;
					}
					case 2 : {
						handleMessage2(senderId, message.message);
						break;
					}
					case 3 : {
						handleMessage3(senderId, message.message);
						break;
					}
				}
				editSender(senderId, senderStep+1);
			}
			//////////////////////////////////////
			//if (message.message) {
			//	handleMessage(senderId, message.message);	
			//}
		}
	}
	res.status(200).send("OK");
});
