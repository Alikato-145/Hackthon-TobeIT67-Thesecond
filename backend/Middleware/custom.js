const rateLimit = require('express-rate-limit');
const Helper = require('../Core/Helper');

const limiter = rateLimit({
	windowMs: 1000*30,
	max: 60, 
    message: 'You has been blocked!',
})

function EndPoint(req,res,next){
    console.log(`${req.headers['x-forwarded-for'] || req.socket.remoteAddress } [${req.method}] ${req.originalUrl}`);
}

async function EmailVeriy(req,res,next){
    const email = await (new Helper.Query()).Select('verify').From('users').Where("id=$1",req.body.user.id).Execute([0]);
    if(email.verify) return next();
    const Response_ = new Helper.Response();
    Response_.Error("Email has not been verified");
    Response_.Status(403);
    var resError = await Response_.Stack();
    res.status(resError.status).send(resError);
}

async function Response(req,res,result){
    if(req && req.rateLimit && req.rateLimit.current > req.rateLimit.limit){
        console.log('\x1b[31m↑ Has been blocked!\x1b[0m');
    }else if(await result.response == undefined && !result.error_message){
        const Response_ = new Helper.Response();
        Response_.Error("Parameter Missing / Function Error / Timeout / No response");
        Response_.Status(400);
        var resError = await Response_.Stack();
        res.status(resError.status).send(resError);
    }else{
        try {
            res.status(result.status).send(result);
        } catch (err) {
            const Response_ = new Helper.Response();
            Response_.Error(err.message);
            Response_.Status(500);
            var resError = await Response_.Stack();
            res.status(resError.status).send(resError);
        }
    }
}

module.exports = {
    limiter,
    EndPoint,
    Response,
    EmailVeriy
}
