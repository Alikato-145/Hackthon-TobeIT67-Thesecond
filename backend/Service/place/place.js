// Core
const {Response,Query,Permission,GetDateTime,SendMail} = require('../../Core/Helper');
const Protect = require('../../Core/Protect');

async function Create(Request){
    const response = new Response();

    await Protect.Validate(Request,['name','time','benefit','wage_rate','description','need_sound_engineer','rush'])
    await Protect.ValidateRole(await Permission(Request.user,'CreatePlace'));

    const user = await (new Query).Select('user_id','fullname').From('organize').Where('user_id=$1',Request.user.id).Execute(0);

    const result = await (new Query).Insert('place',
        ['name','time','benefit','wage_rate','description','need_sound_engineer','rush','owner_name','organize_id'],
        [Request.name,Request.time,Request.benefit,Request.wage_rate,Request.description,Request.need_sound_engineer,Request.rush,user.fullname,user.user_id]
    );

    response.Result(result);

    return response.Stack();
}

async function Read(Request){
    const response = new Response();

    await Protect.ValidateRole(await Permission(Request.user,'Read'));
    // Request.search_id ? await Protect.ValidateRole(await Permission(Request.user,'ReadOther')):null;

    const result = Request.search_id ? await (new Query).Select('id','name','time','benefit','wage_rate','description','need_sound_engineer','rush','owner_name','reserve').From('place').Where('id=$1',Request.search_id).Execute():await (new Query).Select('id','name','time','benefit','wage_rate','description','need_sound_engineer','rush','owner_name','reserve').From('place').Execute()
    response.Result(result);

    return response.Stack();
}

async function Update(Request){
    const response = new Response();

    const result = "no time to code!"
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
    const result = await new Query().UpdateColumns('place',updateModel,'id',Request.search_id?Request.search_id:Request.user.id);
    response.Result(result);

    return response.Stack();
}

module.exports = {
    Create,
    Read,
    Update,
    Delete,
}
