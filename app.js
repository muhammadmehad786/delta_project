if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/expressError.js');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require("./routes/user.js");

                // database connection
const dburl = process.env.ATLASDB_URL;
async function main(){
    mongoose.connect(dburl);
}
main().then((res) => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
})


            //  Middleware functions
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
}) 

store.on("error", () => {
    console.log("error in mongo session store", err);
})

const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false, 
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get('/', (req, res) => {
//     res.send("I am root");
// })

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

            //   create demo user for practice
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     })

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

            //  Insert sample data in listing 
// app.get('/testListing', async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Home",
//         description: "By the Beach",
//         price: 1200,
//         location: "Ichhra, Lahore",
//         country: "Pakistan"
//     })

//     await sampleListing.save();
//     console.log("Sample was Saved");
//     res.send("Successful Testing");
// })


app.all('*', (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
}) 

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something Went Wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("server is running on port: 8080");
})