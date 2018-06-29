// PACKAGES REQUIREMENTS
require("dotenv").config();
var express             = require("express"),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    methodOverride      = require("method-override");
// MODELS REQUIREMENTS
var Campground          = require("./models/campground"),
    Comment             = require("./models/comment"),
    User                = require("./models/user");
// ROUTES REQUIREMENTS
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    userRoutes          = require("./routes/users"),
    indexRoutes         = require("./routes/index");
// OTHER REQUIREMENTS
var seedDB              = require("./seeds");


var app = express();
// mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb://marutovsky:dori123@ds135290.mlab.com:35290/yelpcamp_dm")
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.locals.moment = require("moment");

// Uncomment function below to erase campgrounds db and fill it with default set of campgrounds and comments
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Dori wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// ROUTES
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/users", userRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server Has Started!");
});