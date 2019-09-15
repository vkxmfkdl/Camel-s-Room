// [REQUIREMENTS 선언]
var mongoose    = require('mongoose');
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var session     = require('express-session');
var db = mongoose.connection;
var router		= express.Router();
var User		= require('../models/user'); 

// [MONOGDB CONNECTION]
mongoose.connect('mongodb://localhost/estate_db',{useNewUrlParser : true});
    // UserData in user Model
    router.post('/User', function(req, res){
        console.error("Post to User");
		console.log(req.body);
        var user = new User();
        user.email = req.body.email;
        user.password = req.body.password;
        user.realname = req.body.realname;
        user.tel = req.body.tel;
        user.dob = req.body.dob;
		user.road_address = req.body.road_address;
		user.detail_address = req.body.detail_address;
		
		//DATA INSERT
        user.save(function(err){
            if(err){
                console.error(err);
                res.redirect('/');
                return;
            }
        });
        res.redirect('/');
    });
	
	
	// LOGIN USER
	router.post('/signin', function(req, res){
		var get_email = req.body.email;
		var get_password = req.body.password;

		// 입력받은 로그인 정보를 DB에 검색 조건에 넣어서 확인하는 쿼리문
		var cursor = db.collection("users").find({email : get_email, password: get_password}).toArray(function(err,result){
			if(err)throw err;
			
			if(result == false){
				res.redirect('/api/error_alert');
			}
			else{
				req.session.email = result[0].email;
				req.session.save(() => {
					res.redirect('/');
				});
			}
		});
    });
	
	//LOGOUT USER
	router.get('/logout', function(req, res){
		req.session.destroy();
		var _url = req.url;
		res.clearCookie('sid');
		res.redirect('/');
	});

	//LOGIN FAIL
	router.get('/error_alert', function(req, res){
		res.render('error_alert.ejs');
	 });

module.exports = router;
