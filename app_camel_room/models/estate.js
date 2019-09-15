var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var estateSchema = new Schema({
    title:String,
    saveFileName : [String],
    houseType:String,
    contractTag:String,
    price:Number,
    deposit:Number,
    roadAddress:String,
    detailAddress:String,
    roomSize:Number,
    rooms:Number,
    toilet:Number,
    floors:Number,
    years:Number,
    writer:String,
    latitude : Number,
    longitude : Number,
    views : Number,
    estate_id : String,
    safe_value : Number,
    popular_value : Number,
    education_value : Number,
    traffic_value : Number,
    healthy_value : Number,
    convenience_value : Number,
    theme : String
}, { versionKey: false });

module.exports = mongoose.model('estate', estateSchema);
