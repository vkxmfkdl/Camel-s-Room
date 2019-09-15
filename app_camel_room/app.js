// [LOAD PACKAGES]
var express     = require('express');
var multer		= require('multer');
var app         = express();

var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var session     = require('express-session');
var ps	= require('python-shell')



// [MONGODB CONNECTION]
var db = mongoose.connection;
app.use(express.static('public'));
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});
mongoose.connect('mongodb://localhost/estate_db',{useNewUrlParser : true});

// DEFINE MODEL
var User = require('./models/user');
var Estate = require('./models/estate');


// [APP SET]
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(session({
		key : 'sid',
		secret: 'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
		resave: false,
		saveUninitialized: true
}));


// [CONFIGURE SERVER PORT]

var port = process.env.PORT || 3000;

// [CONFIGURE ROUTER]
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user_routes')
var estateRouter = require('./routes/estate_routes');


// [APP USE]
app.use(express.static('public'));
app.use('/', indexRouter);
app.use('/api', userRouter);
app.use('/api/estate', estateRouter);

// [RUN SERVER]
var server = app.listen(port, function(){
    console.log("Express server has started on port " + port)
});

// [클러스터링 데이터 가져오기]
app.all('/get_data', function(req, res){
	var cursor = db.collection("estates").find({}).toArray(function (err, result) {	
		
		var map_data = new Object();
		var array_data = new Array();
		for (var i=0; i< result.length; i++ ){
			var loc_dic = new Object();
			loc_dic["lat"] = result[i].latitude;
			loc_dic["lng"] = result[i].longitude;
			loc_dic["estate_id"] = result[i].estate_id;
			loc_dic["title"] = result[i].title;
			loc_dic["price"] = result[i].price;
			loc_dic["deposit"] = result[i].deposit;
			loc_dic["contractTag"] = result[i].contractTag;
			loc_dic["roadAddress"] = result[i].roadAddress;
			loc_dic["saveFileName"] = result[i].saveFileName[0];
			loc_dic["safe_value"] = result[i].safe_value;
			loc_dic["popular_value"] = result[i].popular_value;
			loc_dic["traffic_value"] = result[i].traffic_value;
			loc_dic["education_value"] = result[i].education_value;
			loc_dic["healthy_value"] = result[i].healthy_value;
			loc_dic["convenience_value"] = result[i].convenience_value;
			loc_dic["houseType"] = result[i].houseType;
			loc_dic["contractTag"] = result[i].contractTag;
			loc_dic["roomSize"] = result[i].roomSize;
			loc_dic["rooms"] = result[i].rooms;
			loc_dic["toilet"] = result[i].toilet;
			loc_dic["years"] = result[i].years;
			loc_dic["content"] = result[i].content;
			array_data.push(loc_dic);
		}
		map_data["positions"] = array_data;
		// [Recommend]
		res.json(map_data);
	});
});