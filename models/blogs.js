var mongoose=require("mongoose")


//defining schema of collection
var blogSchema= new mongoose.Schema({
	title: String,
	img: String,
	body: String,
	created: {type: Date, default:Date.now},
	user: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref : "user"
		},
		username: String
	}
})

//creating a collection
module.exports = mongoose.model("blog", blogSchema)