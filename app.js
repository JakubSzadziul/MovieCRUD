var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var MongoClient = require('mongodb').MongoClient
var fetch = require("node-fetch");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

//movieDB ********************************************************************************
app.get('/yolo', function (req, res) {
    res.send('Dzien bobry');
    var t = req.query.genre;
    console.log(t)
});

app.post('/', function (req, res) {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        console.log("Nie ma title!")
    } else {
        fetch('http://www.omdbapi.com/?i=tt3896198&apikey=203bbd29&t=' + req.body.title)
            .then(function (response) {
                return response.json();
            }).then(function (fetchedMovie) {
                if (fetchedMovie.Response === "True") {
                    MongoClient.connect('mongodb://SamuraiiJack:Neotest123@ds133533.mlab.com:33533/moviezz', function (err, db) {
                        if (err) throw err;
                        var dbo = db.db("moviezz");
                        dbo.collection("movies").insertOne(fetchedMovie, function (err, res) {
                            if (err) throw err;
                        });
                    });
                }
        })
    }
});

app.post('/delete', function (req, res) {
    MongoClient.connect('mongodb://SamuraiiJack:Neotest123@ds133533.mlab.com:33533/moviezz', function (err, db) {
        if (err) throw err;
        var dbo = db.db("moviezz");
        var titleQuery = {Title: req.body.title};
        dbo.collection("movies").deleteOne(titleQuery, function (err, obj) {
            if (err) throw err;
        });
        dbo.collection("movies").find({}).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            db.close()
        });
    });
});

app.get("/getmovies", function (req, res) {
    MongoClient.connect('mongodb://SamuraiiJack:Neotest123@ds133533.mlab.com:33533/moviezz', function (err, db) {
        if (err) throw err;
        var dbo = db.db("moviezz");
        var genre1 = req.query.genre;

        if (genre1 == null) {
            dbo.collection("movies").find({}).toArray(function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        } else {
            dbo.collection("movies").find({Genre: {$regex: `${genre1}`}}).toArray(function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        }
    });
});

//***************************************************************************


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
