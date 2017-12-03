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
  res.send("Server chạy");
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
storage.initSync({
    dir : "store",
    ttl : false
});
function haveError(object) {
	object.step = 1;
	let response;
	response = {"text": 'Bạn nhập không đúng định dạng. Xin mời gọi cơm từ đầu :('}
	callSendAPI(senderId, response);	
}
function quit(object) {
	object.step = 1;
	let response;
	response = {"text": 'Bạn sẽ gọi cơm lại từ đầu'}
	callSendAPI(senderId, response);	
}
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return earthRadiusKm * c;
}
function timstore(lat1, lon1) {
	ans = 0;
	mi = 1234567890;
	var stores = getAllStores();
	for (var i = 0; i < stores.length; i++) {
		tmp = distanceInKmBetweenEarthCoordinates(lat1, lon1, stores[i].diachiX, stores[i].diachiY);
		if (tmp < mi) {
			ans = i;
		}
	}
	return ans;
}
// CSDL Cua hang
//////////////////////////////////////////////////////////////////////////////////////
function getAllStores() {
	var stores = storage.getItemSync('stores');
	if (typeof stores === "undefined") return [];
	return stores;
}
function searchStore(storeId) {
	var stores = getAllStores();
	var res = -1;
	for (var i = 0; i < stores.length; i++) {
		console.log("Store: " + stores[i].id + '(' + stores[i].step + ')');
		if (stores[i].id === storeId) {
			res = i;
			break;
		}
	}
	return res;
}
function addStore(storeId, storeDiachiX, storeDiachiY, storeStep) {
	var stores = getAllStores();
	stores.push({
		id: storeId,
		diachix: storeDiachiX,
		diachiy: storeDiachiY,
		step: storeStep
	});
	storage.setItemSync('stores', stores);
}
///////////////////////////////////////////////////////////////////////////////////////
/* CSDL Khách hàng */
function getAllKhachs() {
	var khachs = storage.getItemSync('khachs');
	if (typeof khachs === "undefined") return [];
	return khachs;
}

function showKhach() {
	var khachs = getAllSenders();
	khachs.forEach(function(khach) {
		console.log("Khach: " + khach.id + '(' + khach.ten + ')');
		console.log(khach.sdt);
		console.log(khach.soluong);
		console.log(khach.loai);
		console.log(khach.diachiX);
		console.log(khach.diachiY);
		console.log(khach.diachi);
	});
}
/*
function editSender(i, s) {
	var khachs = getAllKhachs();
	for (var j=0; j<khachs.length; j++) 
	if (khachs[j].id === i){
		khachs[j].step = s;
	}
	storage.setItemSync('khachs', khachs);
}
*/
function addKhach(khachId, khachTen, khachSdt, khachSoluong, khachLoai, khachDiachi, khachDiachiX, khachDiachiY) {
	var khachs = getAllKhachs();
	khachs.push({
		id: khachId,
		ten: khachTen,
		sdt: khachSdt,
		diachi : khachDiachi,
		diachiX: khachDiachiX,
		diachiY: khachDiachiY,
		soluong: khachSoluong,
		loai: khachLoai
	});
	storage.setItemSync('khachs', khachs);
}
// tra ve so thu tu i
function searchKhach(khachId) {
	var khachs = getAllKhachs();
	var res = -1;
	for (var i = 0; i < khachs.length; i++) {
		console.log("Khach: " + khachs[i].id + '(' + khachs[i].step + ')');
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
/////////////////////////////////////////////////////////////////////////////////////////
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
function removeSender(senderId) {
	var senders = getAllSenders();
	for (var i=0; i<senders.length; i++) 
	if (senders[i].id === senderId)
	{
		senders.splice(i, 1);
	}
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
	//console.log(received_message.text);
	let response;
	response = {"text": 'Bạn muốn mua bao nhiêu xuất cơm'}
	callSendAPI(senderId, response);	
}
function handleMessage3(senderId, received_message) {
	stt = searchKhach(senderId);
	var khachs = getAllSenders();
	khachs[stt].soluong =  received_message.text;
	storage.setItemSync('khachs', khachs);
	//console.log(khachs[stt].soluong);
	let response;
	response = {
		"text": 'Bạn chọn xuất cơm bao nhiêu tiền?',
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
	try {
		khachs[stt].loai =  received_message.quick_reply.payload;
		storage.setItemSync('khachs', khachs);
	}
	catch (error) {
		khachs[stt].loai = 15;
		storage.setItemSync('khachs', khachs);
	}
	let response;
	response = {"text": 'Số điện thoại của bạn là gì? '}
	callSendAPI(senderId, response);	
}
function handleMessage5(senderId, received_message) {
	stt = searchKhach(senderId);
	var khachs = getAllKhachs();
	khachs[stt].sdt = received_message.text;
	storage.setItemSync('khachs', khachs);
	var response = {
	"text": "Hãy cho chúng tôi địa chỉ của bạn",
    "quick_replies":[
      {
        "content_type":"location"
      }
    ]
	}
	callSendAPI(senderId, response);	
}
function handleMessage6(senderId, received_message) {
	stt = searchKhach(senderId);
	//console.log(received_message.attachments[0].url);
	var khachs = getAllKhachs();
	try {
		khachs[stt].diachiX = received_message.attachments.payload.coordinates.lat;
		khachs[stt].diachiY = received_message.attachments.payload.coordinates.long;
	}
	catch (error)
        {
			khachs[stt].diachi = received_message.message.text;
			khachs[stt].diachiX = -1;
			khachs[stt].diachiY = -1;
            console.log(error.name + ':' + error.message);
        }
	storage.setItemSync('khachs', khachs);
	if (khachs[stt].diachiX !== -1) {
		i = timstore(khachs[stt].diachiX, khachs[stt].diachiY);
		// SEND CHO CUA HANG GAN NHAT
		let response;
		response = {"text": khachs[i].ten};
		callSendAPI(khachs[i].id, response);	
		 response;
		response = {"text": khachs[i].sdt};
		callSendAPI(khachs[i].id, response);
		 response;
		response = {"text": khachs[i].diachi};
		callSendAPI(khachs[i].id, response);
		 response;
		response = {"text": khachs[i].soluong};
		callSendAPI(khachs[i].id, response);
		 response;
		response = {"text": khachs[i].loai};
		callSendAPI(khachs[i].id, response);
	}
	storage.setItemSync('khachs', khachs);
	let response = {"text": 'Đặt hàng thành công !'}
	callSendAPI(senderId, response);
	showKhach();
	removeKhach(stt);
	removeSender(senderId);
}
// ten ban la gi?
// ban muon mua bao nhieu suat com?
// ban muon mua loai bao nhieu tien?
// so dien thoai cua ban la gi?
// cho minh xin dia chi cua ban?

function isQuit(message) {
	text = message.text;
	if (text === 'quit' || text === 'Quit' || text === 'QUIT') return 1; else return 0;
}
function checkQuit(senderId, received_message) {
			if (isQuit(received_message)===1) {
				editSender(senderId, 1);  	
				let response;
				response = {"text": 'Bạn sẽ gọi cơm lại từ đầu'}
				callSendAPI(senderId, response);	
			}
}
app.post('/webhook', function(req, res) {
	addStore('139395406833375',0,0,1);
	var entries = req.body.entry;
	for (var entry of entries) {
		var messaging = entry.messaging;
		for (var message of messaging) 
		if (searchStore(message.sender.id) === -1)
		{
			var senderId = message.sender.id;
			var senderStep = getStep(senderId);
			//console.log(senderId);
			//console.log(senderStep);
			// neu chua co
			if (senderStep === -1) {
				addSender(senderId , 1); 
				senderStep = 1; 
				//console.log('chua co trong csdl');
			}
			// neu da co
			if (message.message) {
				// bat error
				//try {
					switch (senderStep) {
					case 1 : {
						handleMessage1(senderId, message.message);
						checkQuit(senderId, message.message);
						break;
					}
					case 2 : {
						handleMessage2(senderId, message.message);
						checkQuit(senderId, message.message);
						break;
					}
					case 3 : {
						handleMessage3(senderId, message.message);
						checkQuit(senderId, message.message);
						break;
					}
					case 4 : {
						handleMessage4(senderId, message.message);
						checkQuit(senderId, message.message);
						break;
					}
					case 5 : {
						handleMessage5(senderId, message.message);
						checkQuit(senderId, message.message);
						break;
					}
					case 6 : {
						handleMessage6(senderId, message);
						break;
					}
					}
					//catch (error) {
					//	editSender(senderId, 1);  	
					//	let response;
					//	response = {"text": 'Bạn sẽ gọi cơm lại từ đầu'}
					//	callSendAPI(senderId, response);	
					//    console.log(error.name + ':' + error.message);
					//}
				//}
				if (senderStep <= 5) editSender(senderId, senderStep+1); else editSender(senderId, 1);
			}
			//showSenders();
			////////////////////////////////
			//if (message.message) {
			//	handleMessage(senderId, message.message);	
			//}
		}
		// khi cua hang nhan tin
		else {
				tmp = searchStore(message.sender.id);
				var stores = getAllStores();
				if (stores[tmp].step === 1) {
				var response = {
				"text": "Hãy cho chúng tôi địa chỉ của bạn",
				"quick_replies":[
				{
					"content_type":"location"
				}
				]
				}
				callSendAPI(senderId, response);
				}
				else {
					received_message = message.message;
					stores[stt].diachiX = received_message.attachments.payload.coordinates.lat;
					stores[stt].diachiY = received_message.attachments.payload.coordinates.long;	
				}
			}
	}
	res.status(200).send("OK");
});
