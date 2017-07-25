var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var textSearch = require('mongoose-text-search');


//App Config
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//Moongo Schema & Model
mongoose.connect("mongodb://localhost/restful_blogapp", {useMongoClient: true});

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created : { type: Date, default : Date.now}
}); 
// Own created
blogSchema.plugin(textSearch);

var Blog = mongoose.model("Blog", blogSchema);


/*
Blog.create({
    title: "Food World!!",
    image:"https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?dpr=2&auto=format&fit=crop&w=1500&h=2250&q=80&cs=tinysrgb&crop=",
    body: "Wonderful pictures are here"
});
*/
//RESTful Routes
app.get("/", function(req,res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req,res){
    Blog.find({},function(err, blogs){
        if(err){
            console.log(err);
        }
        else{
             res.render("index", {blogs : blogs});
        }
    });
});

//NEW POST FORM
app.get("/blogs/new", function(req,res){
    res.render("new");
});

//CREATE Blog
app.post("/blogs",function(req, res, body){
    var blog = req.body.blog;
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(blog, function(err, blog){
        if(err){
            res.redirect("new");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

//SHOW blog on id
app.get("/blogs/:id", function(req,res){
    var id= req.params.id;
    Blog.findById(id,function(err,foundBlog){
        if(err){
            res.render("/blogs");
        }
        else{
            res.render("show",{blog: foundBlog});
        }
    });
});
    
//EDIT Route
app.get("/blogs/:id/edit",function(req,res){
    var id =req.params.id;
    Blog.findById(id,function(err, editBlog){
        if(err){
            res.render("/blogs");
        }
        else{
           res.render("edit", {blog: editBlog});
        }
    });
   
});

//UPDATE Route 
app.put("/blogs/:id",function(req,res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
   
});

//DELETE Route
app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs");
        }
    });
});

/*=================
//SEARCH functionality
==================*/

app.get("/search", function(req,res){
    var q = req.query.term;
    Blog.find({"title": q}, function(err, blogs){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("search",{blogs: blogs});
        }
    });
   
});

app.listen(process.env.PORT, process.env.IP,function(){
    console.log("Blog App app server started!!");
});