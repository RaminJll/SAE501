var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//reoutes pour l'appi
var mer = require('./routes/api/produits-de-mer');
var boissons = require('./routes/api/boissons');
var condiments = require('./routes/api/condiments');
var feculants = require('./routes/api/feculants');
var produitSucree = require('./routes/api/produits-sucree-gras');
var produitLaitier = require('./routes/api/produits-laitiers');
var proteines = require('./routes/api/proteines');
var matieresGrasses = require('./routes/api/matieres-grasses');
var fruits = require('./routes/api/fruits');
var legumes = require('./routes/api/legumes');

//routes du backend
var inscription = require('./routes/inscription');
var connexion = require('./routes/connexion');
var user = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes pour l'api
app.use('/produits-de-mer', mer);
app.use('/boissons', boissons);
app.use('/condiments', condiments);
app.use('/feculants', feculants);
app.use('/produits-sucree-gras', produitSucree);
app.use('/produits-laitiers', produitLaitier);
app.use('/proteines', proteines);
app.use('/matieres-grasses', matieresGrasses);
app.use('/fruits', fruits);
app.use('/legumes', legumes);

//routes du backend
app.use('/inscription', inscription);
app.use('/connexion', connexion);
app.use('/users', user);



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

module.exports = app;
