var cors = require('cors');
var bodyParser = require('body-parser');
const http = require('http');
var express = require('express');
var app = express();

const hostname = '127.0.0.1';
const port = 8081;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

require('../sftp/app/route/sftp.route')(app);

var server = app.listen(port, hostname, () => {
    // console.clear();
    console.log('\x1b[32m%s\x1b[0m', '========================================================================================================');
    console.log("Servidor Express en http://\x1b[33m%s\x1b[0m:\x1b[32m%s\x1b[0m", hostname, port);
    console.log('\x1b[32m%s\x1b[0m', '========================================================================================================');

})