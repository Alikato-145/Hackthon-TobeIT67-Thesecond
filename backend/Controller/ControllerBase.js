// Core
const Helper = require('../Core/Helper');
const Protect = require('../Core/Protect');
// Modules
const express = require('express');
const bodyParser = require('body-parser');
const listEndpoints = require('express-list-endpoints');
const path = require('path');
// Custom Middleware
const CustomMidleware = require('../Middleware/custom');

require('dotenv').config();

// express
const app = express();
const serverPort = process.env.PORT;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'Document'));
app.use(express.static(path.join(__dirname, '..', 'Document')));

// error handle
process.on('uncaughtException', async (error) => {
    console.error(`\x1b[33m[${path.basename(path.dirname(__filename))}/${path.basename(__filename)}]\x1b[0m \x1b[31mUncaught Exception:\x1b[0m`, error);
    // await Helper.Log(error);
});

// setting
app.use(
    express.urlencoded({extended:false}),
    express.static('build'),
    express.json(),
    bodyParser.urlencoded({extended: true}),
    bodyParser.json(),
)
app.use((req,res,next)=> {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods" , "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept , x-access-token, x-refresh-token, authorization");
    next();
});

// custom middleware
app.use((err,req,res,next)=>{
    CustomMidleware.limiter(req,res,next);
    CustomMidleware.EndPoint(req,res,next);
});

// controller '/api/folder' (/folder/file)
app.use('/api/auth',require('./auth/authentication'));
app.use('/api/account',require('./account/account'));
app.use('/api/file',require('./storage/file'));
// run
app.get('/api',async (req,res)=>{res.send(listEndpoints(app));})
process.env.DOCUMENT=='true'?app.get('/apis',async (req,res)=>{res.render('doc.ejs');}):null

app.listen(serverPort, () => {
    console.log('\x1b[33m[server]   ➜\x1b[36m http://localhost:'+serverPort+'/api'+'\x1b[0m')
    process.env.DOCUMENT=='true'?
    console.log('\x1b[33m[document] ➜\x1b[0m', '\x1b[36mhttp://localhost:' + serverPort + '/apis\x1b[0m'):null
});
module.exports = {
    app,
};
