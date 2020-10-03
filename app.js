var express= require("express"),
	mongoose= require("mongoose"),
	bodyParser= require("body-parser"),
	methodOverride= require("method-override"),
	app= express(),
	blogs = require("./models/blogs"),
	users = require("./models/users"),
	passport = require("passport"),
	localStrategy = require("passport-local"),
	alert = require("alert")

app.set("view engine", "ejs")
app.use(express.static("styles"))
app.use(methodOverride("_method"))
app.use(bodyParser.urlencoded({extended: true}))


//PASSPORT CONFIG-----------
app.use(require("express-session")({
	secret: "I am aayush",
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(users.authenticate()))
passport.serializeUser(users.serializeUser())
passport.deserializeUser(users.deserializeUser())

//Must be placed after passport config
app.use(function(req,res,next){
	res.locals.currentUser = req.user
	next()
})

//connecting to databse and using database
var port = process.env.PORT || 3000
mongoose.connect(
	"mongodb+srv://admin:admin@cluster0.oqtee.mongodb.net/Cluster0?retryWrites=true&w=majority", 
	{useNewUrlParser: true, useUnifiedTopology: true },function(err){
		if (err){
			console.log(err)
		}
	}
	).then(
		app.listen(port, function(req, res){
			console.log(port)
		})
	)



//adding data to collection
/*
blogs.create({
	title: "Demo Blog",
	img: "https://news.blr.com/app/uploads/sites/3/2018/07/Demo-5.jpg",
	body: "Welcome to demo blog",
})
*/

//ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs")
})

app.get("/blogs", function(req, res){
	blogs.find({}, function(err, blogs){
		if (err){
			console.log(err)
		}
		else{
			res.render("blogs/index", {blogs:blogs})
		}
	})
})

app.get("/blogs/new", isLoggedIn, function(req, res){
	//render the form for new blog
	res.render("blogs/new")
	console.log(req.user.username)
})

app.post("/blogs", isLoggedIn ,function(req, res){
	blogs.create(req.body.blogs, function(err, updatedBlogs){
		
		if (err){
			res.redirect("/blogs/new")
		}
		else{
			updatedBlogs.user.username = req.user.username 
			updatedBlogs.user.id = req.user._id 
			updatedBlogs.save()
			res.redirect("/blogs")
		}
	})
})

app.get("/blogs/:id", function(req, res){
	blogs.findById(req.params.id, function(err, selectedBlog){
		if (err){
			console.log(err)
		}
		else{
			res.render("blogs/show", {selectedBlog: selectedBlog})		
		}
	})
})

app.get("/blogs/:id/edit", function(req, res){
	blogs.findById(req.params.id, function(err, blog){
		if (err){
			console.log(err)
			console.log("AAYSU")
		}
		else if ( req.user && req.user.username == blog.user.username){
			res.render("blogs/edit", {blog: blog})	
		}
		else{
			alert("You are not authorized to edit this post.")
			res.redirect("/blogs/" + blog._id)
		}
	})
})

app.put("/blogs/:id" , function(req, res){
	blogs.findByIdAndUpdate(req.params.id, req.body.blogs, function(err, updatedBlog){
		if(err){
			console.log(err)
		}
		else{
			res.redirect("/blogs/"+ req.params.id)
			
		}
	})
})

app.delete("/blogs/:id", function(req,res){
		blogs.findById(req.params.id, "user" ,function(err, blog){
			if (err){
				console.log(err)
			}
			else if (req.user && req.user.username == blog.user.username){
				blogs.findByIdAndDelete(req.params.id , function(err){})
				res.redirect("/blogs")
			}
			else{
				alert("You are not authorized to delete this post.")
				res.redirect("/blogs/" + blog._id)
			}
		})	
	
})

//AUTH ROUTES===============

app.get("/register" , function(req, res){
	res.render("auth/register")
	
})

app.post("/register" , function(req, res){
	var newUser = new users({username:req.body.username})
	users.register( newUser, req.body.password, function(err, user){
		if (err){
			console.log(err)
			return res.redirect("/register")
		}	
		passport.authenticate("local")(req,res,function(){
			res.redirect("/blogs")
		})
	})
})

app.get("/login" , function(req, res){
	res.render("auth/login")
	
})

app.post("/login", passport.authenticate("local", {
	successRedirect: "/blogs",
	failureRedirect: "/login"
}) ,function(req, res){
})

app.get("/logout" , function(req, res){
	req.logout()
	res.redirect("/blogs")
	})

//MIDDLEWARE
function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next()
	}
	else{
		res.redirect("/login")
	}
}
/*
function verifiedUser(req, res, next){
	if (req.isAuthenticated() && req.user._id ==  ){
		return next()
	}
	else{
		res.redirect("/login")
	}
}
*/

