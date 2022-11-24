const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const app = express();
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash');

// Routers
const indexRouter = require('./routes');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const portfoliosRouter = require('./routes/portfolios');
const forumsRouter = require('./routes/forums');
const marketsRouter = require('./routes/markets');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    // secret : 다른 사람에게 노출되면 안됨
    // resave : false, session data가 바뀌기 전까지 session 저장소에 저장하지 않는다
    // saveUninitialized : session이 필요하기 전까지는 session을 구동하지 않는다.
    secret: 'asdfasdfasdf',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}))

app.use(flash());
var passport = require('./lib/passport')(app);

app.post('/auth/login_process', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log('info', info.message);
            req.flash('login', info.message);
            res.redirect('/auth/login');
        }
        req.login(user, function(err) {
            if (err) { return next(err); }
            req.session.save(function() {
                res.redirect('/');
                return;
            });
        });
    })(req, res, next);
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/portfolios', portfoliosRouter);
app.use('/forums', forumsRouter);
app.use('/markets', marketsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const port = process.env.APP_PORT || 8080;

app.listen(port, function() {
    console.log('Example app listening on port ' + port);
});

module.exports = app;