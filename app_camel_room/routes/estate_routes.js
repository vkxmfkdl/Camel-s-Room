// [REQUIREMENTS 선언]
var router = require('express').Router();
var Estate = require('../models/estate');
var multer = require('multer');
var py = require('python-shell');
var mongoose = require('mongoose');
var mysql = require('mysql');
var db = mongoose.connection;
// [MONOGDB CONNECTION]
mongoose.connect('mongodb://localhost/estate_db', { useNewUrlParser: true });

// [MYSQL CONNECTION]
var connection = mysql.createConnection({
    host: 'camel.cy5ept1oyktw.ap-northeast-2.rds.amazonaws.com',
    user: 'camel',
    password: 'mypassword',
    port: 3306,
    database: 'theme'
});

// [FILE UPLOAD PATH]
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().valueOf() + file.originalname);
    }
});
var upload = multer({ storage: storage }).array('estateFile', 10);

router.post('/', function (req, res) {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [req.files]
    }

    console.error("Post to Estate");
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading files");
        }

        // EstateData in Estate Model
        var estate = new Estate();
        estate.title = req.body.title;
        estate.saveFileName = req.files.map(function (file) {
            return file.filename;
        });
        estate.houseType = req.body.houseType;
        estate.contractTag = req.body.contractTag;
        estate.price = req.body.price;
        estate.deposit = req.body.deposit;
        estate.roadAddress = req.body.roadAddress;
        estate.detailAddress = req.body.detailAddress;
        estate.roomSize = req.body.roomSize;
        estate.rooms = req.body.rooms;
        estate.toilet = req.body.toilet;
        estate.floors = req.body.floors;
        estate.years = req.body.years;
        estate.writer = req.body.writer;
        estate.content = req.body.content;
        estate.latitude = req.body.latitude;
        estate.longitude = req.body.longitude;
        estate.views = 0;
        estate.estate_id = new Date().valueOf() + estate.writer[0] + estate.writer[1] + estate.writer[2];
        estate.safe_value = 1;
        estate.popular_value = 1;
        estate.traffic_value = 1;

        // AWS에 있는 MYSQL에서 인테리어 정보를 가져오는 쿼리문 
        connection.connect();
        connection.query('SELECT name FROM theme WHERE id = 1', function (err, rows, field) {
            if (!err) {
                if (rows[0]['name'] != undefined) {
                    console.log('the solution is: ', rows[0]['name']);
                    estate.theme = rows[0]['name']
                }
            } else
                estate.theme = 'undefined'

            console.log("estate.theme is ", estate.theme);
            // [치안가치지수 계산]
            // 탐색의 범위 지정 (250M)
            var Max_lat = parseFloat(req.body.latitude) + 0.003;
            var Min_lat = parseFloat(req.body.latitude) - 0.003;
            var Max_lon = parseFloat(req.body.longitude) + 0.003;
            var Min_lon = parseFloat(req.body.longitude) - 0.003;
            // CCTV 데이터 검색
            var myquery = { "latitude": { $gt: Min_lat, $lt: Max_lat }, 'longitude': { $gt: Min_lon, $lt: Max_lon } };
            var cursor = db.collection("cctv").find(myquery).toArray(function (err, result) {
                if (err) { console.log(err); throw err; }
                estate.safe_value = result.length;
            });
            //탐색의 범위지정(250M)
            var Max_lat2 = String(Max_lat);
            var Min_lat2 = String(Min_lat);
            var Max_lon2 = String(Max_lon);
            var Min_lon2 = String(Min_lon);
            var myquery = { "latitude": { $gt: Min_lat2, $lt: Max_lat2 }, 
                            'longitude': { $gt: Min_lon2, $lt: Max_lon2 } };
            var safe_value = 0;
            //경찰서 데이터 검색
            var policecursor = db.collection("police").find(myquery).toArray(function (err, result) {
                if (err) { console.log(err); throw err; }
                var police_cnt = result.length;
                var cctv_cnt = estate.safe_value;
                if (cctv_cnt > 25 && police_cnt >= 1) {
                    estate.safe_value = 5;
                }
                else if (cctv_cnt > 20 || police_cnt >= 1) {
                    estate.safe_value = 4;
                }
                else if (cctv_cnt > 6) {
                    estate.safe_value = 3;
                }
                else if (cctv_cnt > 3) {
                    estate.safe_value = 2;
                }
                else {
                    estate.safe_value = 1;
                }
                var myquery = { 'estate_id': estateid };
                var newvalue = { $set: { 'safe_value': estate.safe_value } };
                var cursor = db.collection("estates").updateOne(myquery, newvalue, function (err, result) {
                    if (err) throw err;
                    console.log("1 document updated");
                });
            });
            //[교육가치지수 계산]
            var school = parseInt(req.body.school);
            var academy = parseInt(req.body.academy);
            var kindergarten = parseInt(req.body.kindergarten);
            var amount = school + academy + kindergarten;
            console.log("education:", amount);
            if (amount > 35)
                estate.education_value = 5;
            else if (amount > 25)
                estate.education_value = 4;
            else if (amount > 15)
                estate.education_value = 3;
            else if (amount > 5)
                estate.education_value = 2;
            else
                estate.education_value = 1;

            //[건강가치지수 계산]
            var hospital = parseInt(req.body.hospital);
            var pharmacy = parseInt(req.body.pharmacy);
            var amount = hospital + pharmacy;
            if (amount > 20)
                estate.healthy_value = 5;
            else if (amount > 13)
                estate.healthy_value = 4;
            else if (amount > 8)
                estate.healthy_value = 3;
            else if (amount > 4)
                estate.healthy_value = 2;
            else
                estate.healthy_value = 1;
            console.log("healthy:", amount);

            //[편의가치지수 계산]
            var convenience = parseInt(req.body.convenience);
            var culture = parseInt(req.body.culture);
            var cafe = parseInt(req.body.cafe);
            var food = parseInt(req.body.food);
            var amount = convenience + culture + cafe + food;
            if (amount > 50)
                estate.convenience_value = 5;
            else if (amount > 35)
                estate.convenience_value = 4;
            else if (amount > 20)
                estate.convenience_value = 3;
            else if (amount > 5)
                estate.convenience_value = 2;
            else
                estate.convenience_value = 1;
            console.log("convenience:", amount);

            // [교통가치지수]
            var subway = parseInt(req.body.subway);
            var estateid = estate.estate_id;

            var count = 0;
            let request = require('request');
            let cheerio = require('cheerio');
            var $api_url = "http://openapi.tago.go.kr/openapi/service/BusSttnInfoInqireService/getCrdntPrxmtSttnList?ServiceKey=y08K8S5k7cbr1Qif01f5izOmxccvY6Ez%2FRUeHWMyQfP04TODiMtIT%2BW1RWnWXTDqKOAZnkzQQf2Dvoq7VZ9QuA%3D%3D"
                + "&gpsLati=" + req.body.latitude + "&gpsLong=" + req.body.longitude;
            request($api_url, function (err, res, body) {
                $ = cheerio.load(body);
                $('item').each(function () {
                    let no1 = $(this).find('gpslati').text();
                    let no2 = $(this).find('gpslong').text();
                    let no3 = $(this).find('nodeid').text();
                    let no4 = $(this).find('nodenm').text();
                    console.log(`x좌표: ${no1}, y좌표: ${no2}, 코드: ${no3}, 이름: ${no4} `);
                    count = count + 1;
                })
                var amount = count + subway;
                var traffic_value = 1;
                if (amount > 15)
                    traffic_value = 5;
                else if (amount >= 8 || subway >= 1)
                    traffic_value = 4;
                else if (amount >= 4)
                    traffic_value = 3;
                else if (amount >= 2)
                    traffic_value = 2;
                else
                    traffic_value = 1;
                var myquery = { 'estate_id': estateid };
                var newvalue = { $set: { 'traffic_value': traffic_value } };
                var cursor = db.collection("estates").updateOne(myquery, newvalue, function (err, result) {
                    if (err) throw err;
                    console.log("1 document updated");
                });
            })

            console.log(estate);
            estate.save(function (err) {
                if (err) {
                    console.error(err);
                    res.send(err);
                    return;
                }
                res.redirect('/property');
            });

        })
    })

});


module.exports = router;
