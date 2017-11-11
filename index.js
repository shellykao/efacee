var express = require('express'); //require為使用那些模組
var mongodb = require('mongodb'); //使用模組mongodb
var app = express(); //建立express實體，將express初始化，去NEW一個express，變數app才是重點。
var assert = require('assert');
var myParser = require('body-parser');//這是新加的
var accept_ac,accept_pwd,accept_Email,imgURL;
var nodemailer = require('nodemailer');
var rand;
var mailOptions;
var productNumber;
var myproduct;
var mongodbURL =
'mongodb://ABCDEF:a103221070@ds013232.mlab.com:13232/abcd'; //將MongoDB的位置在Server程式碼中以一個變數儲存
var nfc_no,nfc_user,nfc_price,nfc_s,nfc_m,nfc_l;
var myDB; //建立一個全域變數myDB
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

//註冊
app.post('/register', function(request, response){
	//接收帳號
	accept_ac = request.body.User;
	//接收密碼
	accept_pwd = request.body.Password;
	//接收EMAIL
	accept_Email = request.body.myEmail;
	//接收人臉
	imgURL = request.body.face;
	
    console.log(accept_ac);
	console.log(accept_pwd);
	console.log(accept_Email);
	console.log(imgURL);
	//宣告user_account
	var collection = myDB.collection('user_account');
	//找到對應的user
	collection.find({"user":accept_ac,"face":imgURL}).toArray(function(err, docs) {
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


	
	var collection = myDB.collection('product');
	
	collection.find({"number":nfc_no}).toArray(function(err, docs) {
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

//抓先前購買紀錄
app.post('/history',function(request, response){

 
    var MongoClient = mongodb.MongoClient;

    var user = "59aa4fe1ed101b00043a6c89";

 console.log(user);
 
 var collection = myDB.collection('buy_history');
 
 collection.find({user:user}).toArray(function(err, docs) {
  if (err) {
   response.status(406).end();
  } else {
   
   response.type('application/json');
   response.status(200).send(docs);
   response.end();  
   user = null;
   
  }
 });
 collection.remove({user:user},function(err,result){
  if (err){
   console.log(err);
  }else{
   console.log(result);
           
  }
 });
});

//購買紀錄
app.post('/buyhistory', function(request, response){
 
 //accept_history = request.body.User;
 //var user = request.body.User;
 var user = "59aa4fe1ed101b00043a6c89";
 var buyList = request.body.Buy;
 
    console.log(user);
    console.log(buyList);

 
 var collection = myDB.collection('buy_history');
 
 collection.find({user:user}).toArray(function(err, docs) {
  if (err) {
   response.status(406).end();
  } else {

   if(JSON.stringify(docs)=="[]"){
     insertDocument(myDB, user, buyList, function(err, result) {
     if (err) {
      response.type('application/json');
      response.status(500).send(err);
      response.end();
     } else {
      response.type('application/json');
      response.status(200).send(result);
      response.end();
     }
    });
   }
   //原本應該是updata
   else{
    
   		}   
  }
 });
});
var insertDocument = function(myDB, user, list, callback){
  var collection = myDB.collection('buy_history');
  var item = {
   user: user,
   history: list
 }
  collection.insert(item, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    callback(err, result);
 });
}

app.post('/simple', function(request, response){
	var collection = myDB.collection('coat');
	cursor = collection.find({},{image:true})
							.sort({"rate_avg":-1})//排順序
							.skip(parseInt(request.body.SkipCount)*10)//掠過幾筆資料
							.limit(10);//限制幾筆資料
	cursor.toArray(function(err, docs) {
		if (err) {			
			console.log(err);
			response.status(406).end();
		} else {	
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	});	
});

app.post('/product/detail', function(request, response){
 var id=mongodb.ObjectID(request.body.id);
 var collection = myDB.collection('product');
 collection.findOne({'_id': id},function(err, docs) {
  if (err) {
   response.status(406).end();
  } else {
   response.type('application/json');
   response.status(200).send(docs);
   response.end();
  }
 });
});

//插入使用者資料
var insertDocuments = function(myDB){
	var collection = myDB.collection('user_account');
	collection.insertMany([{user : accept_ac,password : accept_pwd,email : accept_Email,checkEmail:"NO",face : imgURL}], function(err, result) {
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











