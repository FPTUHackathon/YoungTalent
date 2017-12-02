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

storage.initSync({
    dir : "senders",
    ttl : false
});

storage.initSync({
    dir : "khach",
    ttl : false
});
/* CSDL Khách hàng */
function getAllKhachs() {
	var khachs = storage.getItemSync('khachs');
	if (typeof khachs === "undefined") return [];
	return khachs;
}

function showKhach() {
	var khachs = getAllSenders();
	khachs.forEach(function(khach) {
		console.log("Khach: " + khach.id + '(' + khach.step + ')');
	});
}
function editSender(i, s) {
	var khachs = getAllKhachs();
	for (var j=0; j<khachs.length; j++) 
	if (khachs[j].id === i){
		khachs[j].step = s;
	}
	storage.setItemSync('khachs', khachs);
}

function addKhach(khachId, khachTen, khachSdt, khachDiachi, khachSoluong, khachLoai) {
	var khachs = getAllKhachs();
	khachs.push({
		id: khachId,
		ten: khachTen,
		sdt: khachSdt,
		diachi: khachDiachi
	});
	storage.setItemSync('khachs', khachs);
}
// tra ve so thu tu i
function searchKhach(khachId) {
	var khachs = getAllKhachs();
	var res = -1;
	for (var i = 0; i < khachs.length; i++) {
		console.log("Sender: " + khachs[i].id + '(' + khachs[i].step + ')');
		if (khachs[i].id === khachId) {
			res = i;
			break;
		}
	}
	return res;
}
function removeKhach(i) {
	var khachs = getAllKhachs();
	khachs.splice(i, 1);
	storage.setItemSync('khachs', khachs);
}

/* CSDL Người gửi */
// thieu
function getAllSenders() {
	var senders = storage.getItemSync('senders');
	if (typeof senders === "undefined") return [];
	return senders;
}

function showSenders() {
	var senders = getAllSenders();
	senders.forEach(function(sender) {
		console.log("Sender: " + sender.id + '(' + sender.step + ')');
	});
}


// tim khach hang
// err chua tim duoc khach hang
function searchSender(senderId) {
	var senders = getAllSenders();
	var res = -1;
	for (var i = 0; i < senders.length; i++) {
		//console.log("Sender: " + senders[i].id + '(' + senders[i].step + ')');
		if (senders[i].id === senderId) {
			res = i;
			break;
		}
	}
	return res;
}

function getStep(senderId) {
	var senders = getAllSenders();
	var res = -1;
	for (var i = 0; i < senders.length; i++) {
		console.log("Sender: " + senders[i].id + '(' + senders[i].step + ')');
		if (senders[i].id === senderId) {
			res = senders[i].step;
			break;
		}
	}
	return res;
}

// cong's edit
function editSender(i, s) {
	var senders = getAllSenders();
	for (var j=0; j<senders.length; j++) 
	if (senders[j].id === i){
		senders[j].step = s;
	}
	storage.setItemSync('senders', senders);
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
	response = {"text": 'Chào bạn! Tôi sẽ cung cấp cho bạn dịch vụ gọi cơm hộp. Tên của bạn là gì?'}
	callSendAPI(senderId, response);	
	// hay xu ly received_message
}
function handleMessage2(senderId, received_message) {
	addKhach(senderId, received_message.text);
	let response;
	response = {"text": 'Bạn muốn mua bao nhiêu xuất cơm'}
	callSendAPI(senderId, response);	
}
function handleMessage3(senderId, received_message) {
	stt = searchKhach(senderId);
	var khachs = getAllSenders();
	khachs[stt].khachSoluong =  received_message.text;
	storage.setItemSync('khachs', khachs);
	let response;
	response = {
		"text": 'Ban muon mua loai bao nhieu tien?',
		"quick_replies": [
		{
			"content_type": "text",
			"title": "15k",
			"payload": "15"
		},
		{
			"content_type": "text",
			"title": "20k",
			"payload": "20"
		}
		]
	}
	callSendAPI(senderId, response);		
}
function handleMessage4(senderId, received_message) {
	stt = searchKhach(senderId);
	var khachs = getAllSenders();
	khachs[stt].khachLoai =  received_message.quick_reply.payload;
	storage.setItemSync('khachs', khachs);
	let response;
	response = {"text": 'Sdt: '}
	callSendAPI(senderId, response);	
}
function handleMessage5(senderId, received_message) {
	stt = searchKhach(senderId);
	var khachs = getAllKhachs();
	khachs[stt].khachSdt = received_message.text;
	storage.setItemSync('khachs', khachs);
	let response;
	response = {"text": 'Dia chi: '}
	callSendAPI(senderId, response);	
}
function handleMessage6(senderId, received_message) {
	stt = searchKhach(senderId);
	var khachs = getAllKhachs();
	khachs[stt].khachDiachi = received_message.text;
	storage.setItemSync('khachs', khachs);
	var response = {"text": 'Dat hang thanh cong.'}
	callSendAPI(senderId, response);
	removeKhach(stt);
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
			var senderStep = getStep(senderId);
			console.log(senderId);
			console.log(senderStep);
			// neu chua co
			if (senderStep === -1) {
				addSender(senderId , 1); 
				senderStep = 0; 
				console.log('chua co trong csdl');
			}
			// neu da co
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
					case 4 : {
						handleMessage4(senderId, message.message);
						break;
					}
					case 5 : {
						handleMessage5(senderId, message.message);
						break;
					}
					case 6 : {
						handleMessage6(senderId, message.message);
						break;
					}
				}
				if (senderStep <= 5) editSender(senderId, senderStep+1);
			}
			//showSenders();
			////////////////////////////////
			//if (message.message) {
			//	handleMessage(senderId, message.message);	
			//}
		}
	}
	res.status(200).send("OK");
});
