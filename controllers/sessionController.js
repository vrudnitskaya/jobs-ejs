const User = require("../models/User");
const parseVErr = require("../utils/parseValidationErrs");

const registerShow = (req, res) => {
  res.render("register");
};

const registerDo = async (req, res, next) => {
  try {
    if (req.body.password !== req.body.password1) {
      req.flash("errors", "The passwords entered do not match.");
      return res.render("register", { errors: req.flash("errors"), formData: req.body });
    }
    
    await User.create(req.body);
    return res.redirect("/");
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
      req.flash("errors", "There were validation errors.");
    } else if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("errors", "That email address is already registered.");
    } else {
      return next(e);
    }
    return res.render("register", { errors: req.flash("errors"), formData: req.body });
  }
};

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      return res.redirect("/"); 
    }
    res.redirect("/");
  });
};

const logonShow = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("logon");
};

module.exports = {
  registerShow,
  registerDo,
  logoff,
  logonShow,
};