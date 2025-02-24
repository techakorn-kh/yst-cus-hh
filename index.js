const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();
const port = config.APP_PORT;

const indexRoutes = require('./routes/index');

// view engine setup
app.use(cors());
app.use(session({
    secret: 'secret',
    name: 'session',
    keys: ['key1','key2']
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoutes);

app.listen(port, () => {
    console.log(`\r\n Example app listening on port ${port} \r\n`);
});