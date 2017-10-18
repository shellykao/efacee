var express = require('express'); //require為使用那些模組
var mongodb = require('mongodb'); //使用模組mongodb
var app = express(); //建立express實體，將express初始化，去NEW一個express，變數app才是重點。
var assert = require('assert');
var myParser = require('body-parser');
var accept_ac,accept_pwd,accept_Email;
var nodemailer = require('nodemailer');
var rand;
var mailOptions;
var mongodbURL =
'mongodb://ABCDEF:a103221070@ds013232.mlab.com:13232/abcd'; //將MongoDB的位置在Server程式碼中以一個變數儲存
var myDB; //建立一個全域變數myDB
var nfc_no,nfc_user,nfc_price,nfc_s,nfc_m,nfc_l;
app.set('port', (process.env.PORT || 5000));

//提高上傳限制
app.use(myParser({limit: '50mb'}));

app.use(myParser.urlencoded({extended : true}));

//登入
app.post('/login',function(request, response){
	//接收使用者帳號
	accept_ac = request.body.User;
	//接收使用者密碼
	accept_pwd = request.body.Password;
    console.log(accept_ac);
	console.log(accept_pwd);
	//宣告user_account
	var collection = myDB.collection('user_account');
	//找到對應的帳號密碼
	collection.find({"user":accept_ac,"password":accept_pwd}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			//找到後回傳
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			//將之設為空
			accept_ac = null;
			accept_pwd = null;
		}
	});
});

app.post('/nfc',function(request, response){
	
	nfc_no = request.body.Number;
	nfc_user=request.body.User;
	nfc_price=request.body.Price;
	nfc_s=request.body.Ss;
	nfc_m=request.body.Ms;
	nfc_l=request.body.Ls;

    console.log(nfc_no);
	console.log(nfc_user);
	console.log(nfc_price);
	console.log(nfc_s);
	console.log(nfc_m);
	console.log(nfc_l);


	
	var collection = myDB.collection('clothes');
	
	collection.find({"number":nfc_no,"user":nfc_user,"price":nfc_price,"S":nfc_s,"M":nfc_m,"L":nfc_l}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			
			nfc_no = null;
			nfc_user = null;
			nfc_price = null;
			nfc_s = null;
			nfc_m = null;
			nfc_l = null;

		}
	});
});
var insertDocument = function(myDB){
 var collection = myDB.collection('buy_history');
 collection.insertMany([{user : accept_history}], function(err, result) {
 assert.equal(err, null);
 assert.equal(1, result.result.n);
 assert.equal(1, result.ops.length);
 });

}

//註冊
app.post('/register', function(request, response){
	//接收帳號
	accept_ac = request.body.User;
	//接收密碼
	accept_pwd = request.body.Password;
	//接收EMAIL
	accept_Email = request.body.myEmail;
    console.log(accept_ac);
	console.log(accept_pwd);
	console.log(accept_Email);
	//宣告user_account
	var collection = myDB.collection('user_account');
	//找到對應的user
	collection.find({"user":accept_ac}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			//若找不到代表此帳號無人使用 如此此帳號可使用
			if(JSON.stringify(docs)=="[]"){
				insertDocuments(myDB, function() {
				});
			}
			else{
			}
		}
	});
});


//插入使用者資料
var insertDocuments = function(myDB){
	var collection = myDB.collection('user_account');
	collection.insertMany([{user : accept_ac,password : accept_pwd,email : accept_Email,checkEmail:"NO"}], function(err, result) {
	assert.equal(err, null);
	assert.equal(1, result.result.n);
	assert.equal(1, result.ops.length);
	});
}
//宣告發信物件
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'shelly011793@gmail.com',
        pass: 'nckwknyztrrsuzse'
    }
});


//送信
app.post('/send',function(req,res){
	//宣告一個亂數
    rand=Math.floor((Math.random() * 1000) + 54);
	//宣告資料庫user_account的資料表
	var collection = myDB.collection('user_account');
	//將亂數加入指定user以便日後認證
	collection.update({user:accept_ac}, {$set: {randNumber:rand}});
	//取得host address
	host=req.get('host');
	//鏈結網址
	link="http://"+req.get('host')+"/verify?id="+rand;
	//寄信內容
	mailOptions={
		from: '"e-face" <shelly011793@gmail.com>', 
		to : accept_Email,
		subject : "verify your e-mail",
		html : "<br> please click the button to verify e-mail<br><a href="+link+">to verify</a>"	
	}
	console.log(mailOptions);
	//發送郵件
	transporter.sendMail(mailOptions, function(error, response){
   	 if(error){
        	console.log(error);
		res.end("error");
	 }else{
        	console.log("Message sent: " + response.message);
		res.end("sent");
    	 }
	});
});

//認證
app.get('/verify',function(req,res){
	console.log(req.protocol+":/"+req.get('host'));
	//確認信箱的人是否與申請者的host相同
	if((req.protocol+"://"+req.get('host'))==("http://"+host))
	{
		console.log("Domain is matched. Information is from Authentic email");
		//若亂數相同
		if(req.query.id==rand)
		{
			console.log("email is verified");
			//show出網頁的內容
			res.end(mailOptions.to+" verify successfully now you can enjoy this APP-eface");
			var collection = myDB.collection('user_account');
			//更改資料表中對應rand之帳號的checkEmail
			collection.update({randNumber:rand}, {$set: {checkEmail:"OK"}});
		}
		else
		{
			console.log("email is not verified");
			res.end("<h1>Bad Request</h1>");
		}
	}
	else
	{
		res.end("<h1>Request is from unknown source");
	}
});




mongodb.MongoClient.connect(mongodbURL, function(err, db){ //使用mongodb.MongoClient的方法connect()進行連線
	if(err){                                               //事件監聽器用在非同步程式碼，不確定何時會用到
		console.log(err);                                  //若回傳的參數有error，用console.log()印出錯誤內容
	} else{
		myDB = db;                                         //在mongoDB成功連線後，留住db物件
		console.log('connection success');                 //若沒有錯誤表示連線成功，印出connection success
	}
});



app.get('/', function(request, response){ //app.get就是幫你做路由(分辨做哪種事情，類似事件監聽器 ex:新增資料、查詢資料、刪除資料、修改資料)。
	response.status(200).send('<html><body><H1>Hello World</H1></body></html>'); // 200為http通訊協定 表示連線成功
	response.end(); //end為回傳給使用者
});

app.get('/api/test', function(request, response){ //連接到/api/test才會做的事情，request帶有連接進來的資訊(參數)，response為回傳的內容。
	var collection = myDB.collection('test'); //使用myDB的方法collection('data')取得data這個collection
	collection.find({}).toArray(function(err, docs){ //使用collection的方法find()取得資料表內的內容，{}表示取得全部內容
		if(err){                                     //使用toArray()將資料轉成陣列，function的docs是轉成陣列後的結果
			response.status(406).send(err);
			response.end();              //轉陣列過程若有err，回傳給錯誤碼406，此為Http協定狀態碼      
		} else{                                      //.end()為將資料回傳給使用者
			response.type('application/json');       //沒有錯誤回傳狀態碼200並附帶著資料，因為MongoDB存的資料就是JSON，所以不用特別轉換
			response.status(200).send(docs);
			response.end();
		}
   });
});

//app.listen(process.env.PORT || 5000);
//console.log('port ' + (process.env.PORT || 5000)); //啟動伺服器，聆聽port 5000。預設為80port，所以多半被別人佔走。IP:127.0.0.1:5000，domain:http://localhost:5000
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});








