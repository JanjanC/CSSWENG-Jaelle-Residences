//import the necessary modules
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const routes = require('./routes/routes.js')
const mongoose = require('mongoose');
const db = require('./models/db.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();

//parse incoming requests with urlencoded payloads
app.use(bodyParser.urlencoded({extended: false}));
//set the file path containing the static assets
app.use(express.static(path.join(__dirname, 'public')));
//set the file path of the paths defined in './routes/routes.js'
app.use('/', routes);
//set the session middleware
app.use(
    session({
        secret: 'jaelle-residences',
        resave: 'false',
        saveUninitialized: 'false',
        store: MongoStore. create({mongoUrl: process.env.DB_URL})
    })
);

//set hbs as the view engine
app.set('view engine', 'hbs');
//set the file path containing the hbs files
app.set('views', path.join(__dirname, 'views'))
//set the file path containing the partial hbs files
hbs.registerPartials(path.join(__dirname, 'views/partials'));

//connect to the database
db.connect();

//bind the server to a port
app.listen(process.env.PORT, function() {
    console.log(`Server is running at http://${process.env.HOSTNAME}:${process.env.PORT}`);
});

module.exports = app;
