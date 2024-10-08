const express = require("express");
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const passportInit = require("./passport/passportInit");
require("express-async-errors");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

//Security Packages
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
});

app.use(limiter);

// Body parser
app.use(express.urlencoded({ extended: true }));
//now it replaces the part of script tag if somebody tries to send it via form
app.use(xss());
// Cookie Parser
app.use(cookieParser(process.env.SESSION_SECRET));

// CSRF Protection
let csrf_development_mode = true;
if (app.get("env") === "production") {
    csrf_development_mode = false;
    app.set("trust proxy", 1);
}
const csrf_options = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
};
app.use(csrf(csrf_options));

// Session configuration
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}

const store = new MongoDBStore({
    uri: mongoURL,
    collection: "mySessions",
});
store.on("error", function (error) {
    console.log(error);
});

const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

// Passport initialization
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Other middleware
app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

app.use((req, res, next) => {
    if (req.path == "/multiply") {
      res.set("Content-Type", "application/json");
    } else {
      res.set("Content-Type", "text/html");
    }
    next();
  });
  
// Routes
app.get("/", (req, res) => {
    res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

app.get("/multiply", (req, res) => {
    const result = req.query.first * req.query.second;
    if (result.isNaN) {
      result = "NaN";
    } else if (result == null) {
      result = "null";
    }
    res.json({ result: result });
});

//Secret word handling
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
app.use("/secretWord", auth, secretWordRouter);

//Jobs routes handling
const jobsRouter = require("./routes/jobs");
app.use("/", auth, jobsRouter);


// Error handling
app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});

const port = process.env.PORT || 3000;
const start = () => {
  try {
    require("./db/connect")(mongoURL);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();

module.exports =  {app} ;