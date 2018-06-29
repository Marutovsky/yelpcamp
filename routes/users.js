var express = require("express"),
    router  = express.Router();
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require("../middleware");

var multer = require("multer");
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require("cloudinary");
cloudinary.config({ 
    cloud_name: "doskxgaqi", 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// USER PROFILE
router.get("/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        }
    Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
        if(err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        }
        res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        });
    });
});

// EDIT USER PROFILE
router.get("/:id/edit", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User not found");
            return res.redirect("back");
        }
        res.render("users/edit", {user: foundUser}); 
    });
});

// UPDATE USER
router.put("/:id", middleware.checkProfileOwnership, upload.single("avatar"), function(req, res){
    User.findById(req.params.id, async function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if(req.file){
                try {
                    await cloudinary.v2.uploader.destroy(user.avatarId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    user.avatarId = result.public_id;
                    user.avatar = result.secure_url;
                } catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            user.firstName = req.body.user.firstName;
            user.lastName = req.body.user.lastName;
            user.description = req.body.user.description;
            await user.save();
            req.flash("success", "Successfully Updated!");
            res.redirect("/users/" + user._id);
        }
    });
});

router.delete("/:id", middleware.checkProfileOwnership, function(req, res){
    User.findById(req.params.id, async function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(user.avatarId);
            user.remove();
            req.flash("success", "User deleted successfully!");
            res.redirect("/campgrounds");
        } catch(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
    });
});

module.exports = router;