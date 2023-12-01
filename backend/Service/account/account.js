// Core
const {Response,Query,Permission,GetDateTime,SendMail} = require('../../Core/Helper');
const Protect = require('../../Core/Protect');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

async function Create(Request){
    const response = new Response();

    await Protect.Validate(Request,['username','password','email','phone'])

    await Protect.ValidateUsername(Request.username);
    await Protect.ValidatePassword(Request.password);
    await Protect.ValidateEmail(Request.email);
    await Protect.ValidatePhone(Request.phone);
    await Protect.DuplicateCheck('users','username',Request.username);
    await Protect.DuplicateCheck('users','email',Request.email);
    await Protect.DuplicateCheck('users','phone',Request.phone);

    const result = await (new Query).Insert('users',
        ['username', 'email', 'password', 'token', 'refreshtoken', 'verifyemail_token', 'forgotpassword_token','role','phone'],
        [Request.username, Request.email,await Protect.Hash(Request.password), 'access_token', 'refresh_token', null, null,'user',Request.phone]
    );
    response.Result(result);

    return response.Stack();
}

async function validateTest(Request){
    const response = new Response();
    
    await Protect.ValidateObj(Request,response)
    if(!response.success) return response.Stack();

    return response.Stack();
}

async function ReadAll(Request){
    const response = new Response();

    await Protect.ValidateRole(await Permission(Request.user,'ReadAll'));

    const result = await (new Query).Select('id','username','email','role','isactive','isdelete','verify').From('users').Execute();
    response.Result(result);

    return response.Stack();
}

async function Read(Request){
    const response = new Response();

    await Protect.ValidateRole(await Permission(Request.user,'Read'));
    Request.search_id ? await Protect.ValidateRole(await Permission(Request.user,'ReadOther')):null;

    const result = await (new Query).Select('id','username','email','role','verify').From('users').Where('id=$1',Request.search_id?Request.search_id:Request.user.id).Execute();
    response.Result(result);

    return response.Stack();
}

async function Update(Request){
    const response = new Response();

    const user = await (new Query).Select('username','password','email').From('users').Where('id=$1',Request.search_id?Request.search_id:Request.user.id).Execute(0);

    if(user.email!=Request.email) await Protect.DuplicateCheck('users','email',Request.email);
    if(user.username!=Request.username) await Protect.DuplicateCheck('users','username',Request.username);
    
    Request.search_id ? await Protect.ValidateRole(await Permission(Request.user,'UpdateAll')):null;

    await Protect.ValidateEmail(Request.email);
    await Protect.ValidateUsername(Request.username);
    await Protect.ValidatePassword(Request.password);

    const updateModel = {
        email : Request.email,
        password : await Protect.Hash(Request.password),
        verifyemail_token: null,
        verify: false,
        update_date: GetDateTime(),
        update_by: user.username
    }

    const result = await (new Query).UpdateColumns('users',updateModel,'id',Request.search_id?Request.search_id:Request.user.id);
    response.Result(result);

    return response.Stack();
}

async function Delete(Request){
    const response = new Response();
    await Protect.ValidateRole(await Permission(Request.user,'Delete'));
    Request.search_id ? await Protect.ValidateRole(await Permission(Request.user,'DeleteAll')):null;

    const updateModel = {
        isactive: false,
        isdelete: true,
        token: null,
        refreshtoken: null,
        username: 'd',
        email: 'd',
        password: 'd',
        verifyemail_token: null,
        forgotpassword_token: null,
        delete_date: GetDateTime(),
        delete_by: Request.user.id
    }
    const result = await new Query().UpdateColumns('users',updateModel,'id',Request.search_id?Request.search_id:Request.user.id);
    response.Result(result);

    return response.Stack();
}

async function ForgotPassword(Request){
    const response = new Response();

    await Protect.Validate(Request,['email'])
    await Protect.ValidateEmail(Request.email);
    
    const token = jwt.sign({email:Request.email},process.env['reset_password_token'],{ expiresIn: process.env.TOKEN_TIME });

    const result = await SendMail(Request.email,'Reset-Password',`Your reset password token is: ${token}`)

    response.Result(result);
    return response.Stack();
}

async function ResetPasswordWithToken(Request){
    const response = new Response();

    await Protect.Validate(Request,['token','password'])

    const decoded = jwt.verify(Request.token, process.env['reset_password_token'])
    const user = await (new Query()).Select('id', 'password').From('users').Where('email=$1', decoded.email).Execute(0);

    if (user) {
        const result = await (new Query()).UpdateColumn('users', 'password', await Protect.Hash(Request.password), 'email', decoded.email);
        response.Result(result);
    } else {
        throw new Error('fail to reset password (account not found or no any account use this email)');
    }
    return response.Stack();

}

module.exports = {
    Create,
    validateTest,
    ReadAll,
    Read,
    Update,
    Delete,
    ForgotPassword,
    ResetPasswordWithToken,
}
