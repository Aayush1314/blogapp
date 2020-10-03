var mongoose= require("mongoose")
var passportLocalMongoose= require("passport-local-mongoose")

// SETTING THE SCHEMA-----START 
var user_schema=new mongoose.Schema({
	username: String,
	password: String,
})
// SETTING THE SCHEMA-----END 

user_schema.plugin(passportLocalMongoose)

// CREATING A COLLECTION IN DATABASE------START
module.exports = mongoose.model("user", user_schema)
// CREATING A COLLECTION IN DATABASE------END