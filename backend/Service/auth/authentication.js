// Core
const {Response,Query,NewObj} = require('../../Core/Helper');
const Protect = require('../../Core/Protect');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function Login(Request){
    const response = new Response();
    await Protect.Validate(Request,['username','password'])

    const user = await (new Query).Select('id','username','password','email','created_date','token','refreshtoken','role').From('users').Where('username=$1',Request.username).Execute(0);

    if(user && await Protect.HashCompare(Request.password,user.password)){
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_KEY, { expiresIn: process.env.REFRESH_TOKEN_TIME});
        const acessToken = jwt.sign({id:user.id,email:user.email},process.env.TOKEN_KEY,{ expiresIn: process.env.TOKEN_TIME });

        const updates = {
            refreshtoken: refreshToken,
            token: acessToken,
        };
        await (new Query).UpdateColumns('users',updates,'id',user.id);

        user.refreshToken = refreshToken;
        user.token = acessToken;
        const result = NewObj(user,['id','username','email','created_date','token','refreshToken','role'])

        response.Result(result);
    }else{
        throw new Error('Username or Password is incorrect!');
    }

    return response.Stack();
}
async function RefreshToken(Request){
    const response = new Response();

    const refreshToken = Request.body.refreshToken || Request.query.refreshToken || Request.headers['x-refresh-token'];

    if (!refreshToken || refreshToken=='undefined') {
        throw new Error('Refresh token is missing');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);

        const storedRefreshTokenResult = await (new Query).Select('refreshtoken').From('users').Where('id=$1',decoded.id).Execute(0);

        if (!storedRefreshTokenResult || storedRefreshTokenResult.refreshtoken !== refreshToken) {
            throw new Error('Invalid refresh token');
        }

        const accessToken = jwt.sign({ id: decoded.id, email: decoded.email }, process.env.TOKEN_KEY, { expiresIn: process.env.TOKEN_TIME});
        await (new Query).UpdateColumn('users','token',accessToken,'id',decoded.id);

        const result = {"accessToken" : accessToken , "refreshToken": refreshToken};
        response.Result(result);
    } catch (err) {
        throw new Error('Invalid refresh token');
    }
    return response.Stack();
}

module.exports = {
    Login,
    RefreshToken
}
