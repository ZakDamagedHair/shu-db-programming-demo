var express = require('express');
var mongodb = require('mongodb');
var app = express();

//var uri = 'mongodb://zak:love8355@ds043082.mongolab.com:43082/sensordb';
var uri = 'mongodb://visiter:visiter@ds023490.mlab.com:23490/studens_db'
//var uri = 'mongodb://root:root@ds023490.mlab.com:23490/studens_db'
var database;

mongodb.MongoClient.connect(uri, function(err, db) {
	if (err) {
		console.log('connect mongo db error ' + err);
	} else {
		console.log('connect mongo db success');
		database = db;
	}
});

app.get('/api/initiScore', function(request, response) {
	/* if (!request.query.value) {
		__sendErrorResponse(response, 403, 'No query parameters value');
		return;
	} */
	var items=database.collection('score');
	items.remove();
	
	var major_list=['資管', '資科', '網科', '資工', '資傳'];
	var insert_all=[];
	
	for(var i=1; i<=100; i++){
		var _id='A' + i.length==1?'00'+i.toString():i.length==2?'0'+i.toString():i.toString();
		var name=String.fromCharCode((i%26)+64)+String.fromCharCode(Math.random()*25+97) + '同學';
		var sex=Math.floor(Math.random()*2);
		var major=major_list[Math.floor(Math.random()*5)];
		var score=Math.floor(Math.random()*100+1);
		var insert = {_id:_id, name:name, sex:sex, major:major, score:score};
		insert_all.push(insert);
	}		
	
	items.insert(insert_all, function(err, result) {
		if (err) {
			__sendErrorResponse(response, 406, err+':'+i);
		} else {
			response.type('application/json');
			response.status(200).send(result+':'+i);
			response.end();
		}
	});
});

app.get('/api/selectAll', function(request, response) {	
	var items=database.collection('score');
	
	var sex=parseInt(request.query.sex,10)||-1;
	var major=request.query.major||'';
	var score_low=parseInt(request.query.low,10)||0;
	var scroe_high=parseInt(request.query.high,10)||100;
	var order=parseInt(request.query.order,10)||-1;
	//1(小到大) : -1(大到小)
	var limit=parseInt(request.query.limit, 10) || 100;
	
	var find_str={};
	if(sex!=-1){find_str['sex']=sex;}
	if(major!=''){find_str['major']=major;} 
	find_str['score']={$gt:score_low,$lt:scroe_high};	
	console.log(find_str);
	
	items.find(find_str).sort({'score':order}).limit(limit).toArray(function (err, docs) {
		if (err) {
			console.log(err);
			__sendErrorResponse(response, 406, err);
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	});
});

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.listen(process.env.PORT || 5000);
console.log('port ' + (process.env.PORT || 5000));

function __sendErrorResponse(response, code, content) {
	var ret = {
		err: code,
		desc : content 
	};
	response.status(code).send(ret);
	response.end();
}
