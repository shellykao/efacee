var express = require('express'); //require���ϥΨ��ǼҲ�
var mongodb = require('mongodb'); //�ϥμҲ�mongodb
var app = express(); //�إ�express����A�Nexpress��l�ơA�hNEW�@��express�A�ܼ�app�~�O���I�C
var assert = require('assert');
var myParser = require('body-parser');
var accept_ac,accept_pwd,accept_Email;
var nodemailer = require('nodemailer');
var rand;
var mailOptions;
var mongodbURL =
'mongodb://ABCDEF:a103221070@ds013232.mlab.com:13232/abcd'; //�NMongoDB����m�bServer�{���X���H�@���ܼ��x�s
var myDB; //�إߤ@�ӥ����ܼ�myDB
var nfc_no,nfc_user,nfc_price,nfc_s,nfc_m,nfc_l;
app.set('port', (process.env.PORT || 5000));

//�����W�ǭ���
app.use(myParser({limit: '50mb'}));

app.use(myParser.urlencoded({extended : true}));

//�n�J
app.post('/login',function(request, response){
	//�����ϥΪ̱b��
	accept_ac = request.body.User;
	//�����ϥΪ̱K�X
	accept_pwd = request.body.Password;
    console.log(accept_ac);
	console.log(accept_pwd);
	//�ŧiuser_account
	var collection = myDB.collection('user_account');
	//���������b���K�X
	collection.find({"user":accept_ac,"password":accept_pwd}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			//����^��
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			//�N���]����
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

//���U
app.post('/register', function(request, response){
	//�����b��
	accept_ac = request.body.User;
	//�����K�X
	accept_pwd = request.body.Password;
	//����EMAIL
	accept_Email = request.body.myEmail;
    console.log(accept_ac);
	console.log(accept_pwd);
	console.log(accept_Email);
	//�ŧiuser_account
	var collection = myDB.collection('user_account');
	//��������user
	collection.find({"user":accept_ac}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			//�Y�䤣��N���b���L�H�ϥ� �p�����b���i�ϥ�
			if(JSON.stringify(docs)=="[]"){
				insertDocuments(myDB, function() {
				});
			}
			else{
			}
		}
	});
});


//���J�ϥΪ̸��
var insertDocuments = function(myDB){
	var collection = myDB.collection('user_account');
	collection.insertMany([{user : accept_ac,password : accept_pwd,email : accept_Email,checkEmail:"NO"}], function(err, result) {
	assert.equal(err, null);
	assert.equal(1, result.result.n);
	assert.equal(1, result.ops.length);
	});
}
//�ŧi�o�H����
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'shelly011793@gmail.com',
        pass: 'nckwknyztrrsuzse'
    }
});


//�e�H
app.post('/send',function(req,res){
	//�ŧi�@�Ӷü�
    rand=Math.floor((Math.random() * 1000) + 54);
	//�ŧi��Ʈwuser_account����ƪ�
	var collection = myDB.collection('user_account');
	//�N�üƥ[�J���wuser�H�K���{��
	collection.update({user:accept_ac}, {$set: {randNumber:rand}});
	//���ohost address
	host=req.get('host');
	//�쵲���}
	link="http://"+req.get('host')+"/verify?id="+rand;
	//�H�H���e
	mailOptions={
		from: '"e-face" <shelly011793@gmail.com>', 
		to : accept_Email,
		subject : "verify your e-mail",
		html : "<br> please click the button to verify e-mail<br><a href="+link+">to verify</a>"	
	}
	console.log(mailOptions);
	//�o�e�l��
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

//�{��
app.get('/verify',function(req,res){
	console.log(req.protocol+":/"+req.get('host'));
	//�T�{�H�c���H�O�_�P�ӽЪ̪�host�ۦP
	if((req.protocol+"://"+req.get('host'))==("http://"+host))
	{
		console.log("Domain is matched. Information is from Authentic email");
		//�Y�üƬۦP
		if(req.query.id==rand)
		{
			console.log("email is verified");
			//show�X���������e
			res.end(mailOptions.to+" verify successfully now you can enjoy this APP-eface");
			var collection = myDB.collection('user_account');
			//����ƪ�����rand���b����checkEmail
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




mongodb.MongoClient.connect(mongodbURL, function(err, db){ //�ϥ�mongodb.MongoClient����kconnect()�i��s�u
	if(err){                                               //�ƥ��ť���Φb�D�P�B�{���X�A���T�w��ɷ|�Ψ�
		console.log(err);                                  //�Y�^�Ǫ��ѼƦ�error�A��console.log()�L�X���~���e
	} else{
		myDB = db;                                         //�bmongoDB���\�s�u��A�d��db����
		console.log('connection success');                 //�Y�S�����~��ܳs�u���\�A�L�Xconnection success
	}
});



app.get('/', function(request, response){ //app.get�N�O���A������(���밵���بƱ��A�����ƥ��ť�� ex:�s�W��ơB�d�߸�ơB�R����ơB�ק���)�C
	response.status(200).send('<html><body><H1>Hello World</H1></body></html>'); // 200��http�q�T��w ��ܳs�u���\
	response.end(); //end���^�ǵ��ϥΪ�
});

app.get('/api/test', function(request, response){ //�s����/api/test�~�|�����Ʊ��Arequest�a���s���i�Ӫ���T(�Ѽ�)�Aresponse���^�Ǫ����e�C
	var collection = myDB.collection('test'); //�ϥ�myDB����kcollection('data')���odata�o��collection
	collection.find({}).toArray(function(err, docs){ //�ϥ�collection����kfind()���o��ƪ������e�A{}��ܨ��o�������e
		if(err){                                     //�ϥ�toArray()�N����ন�}�C�Afunction��docs�O�ন�}�C�᪺���G
			response.status(406).send(err);
			response.end();              //��}�C�L�{�Y��err�A�^�ǵ����~�X406�A����Http��w���A�X      
		} else{                                      //.end()���N��Ʀ^�ǵ��ϥΪ�
			response.type('application/json');       //�S�����~�^�Ǫ��A�X200�ê��a�۸�ơA�]��MongoDB�s����ƴN�OJSON�A�ҥH���ίS�O�ഫ
			response.status(200).send(docs);
			response.end();
		}
   });
});

//app.listen(process.env.PORT || 5000);
//console.log('port ' + (process.env.PORT || 5000)); //�Ұʦ��A���A��ťport 5000�C�w�]��80port�A�ҥH�h�b�Q�O�H�����CIP:127.0.0.1:5000�Adomain:http://localhost:5000
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});








