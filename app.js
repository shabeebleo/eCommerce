const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const db = require('./config/connection');
const session = require('express-session')
const Swal = require('sweetalert2')

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  helpers: {
    inc: function (value) { return value + 1; },
    eqPacked: (status)=>{
      return status==='packed'? true : false
    },
    eqShipped: (status)=>{
      return status==='shipped'? true : false
    }
    ,
    eqPlaced: (status)=>{
      return status==='placed'? true : false
    },
    eqPending: (status)=>{
      return status==='pending'? true : false
    },
    isoToDate:(date)=>{
      return date.toDateString()
    }
  },
  extname: 'hbs', defaultLayout: 'user-layout', layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
  res.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
  next();
})

app.use(session({ secret: process.env.SESSION_SECRET, cookie: { maxAge: 600000 } }))

db.connect((err) => {
  if (err)
    console.log("Connection Error" + err);
  else console.log("Database Connected to port27017");
})
// app.use(nocache())

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
  res.render('user/error');
});

module.exports = app;
