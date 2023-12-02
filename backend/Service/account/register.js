// Core
const {Response,Query,Permission,GetDateTime,SendMail} = require('../../Core/Helper');
const Protect = require('../../Core/Protect');

async function Create(Request){
    const response = new Response();

    await Protect.Validate(Request,['prefix','fullname','age','birthday','id_card','role'])
    await Protect.ValidateIdCard(Request.id_card);

    const roleMasterData = ['artist','organize']
    const prefixMasterData = ['เด็กชาย','เด็กหญิง','นาย','นาง','นางสาว']

    if(!roleMasterData.includes(Request.role)) throw new Error('Invalid role')
    if(!prefixMasterData.includes(Request.prefix)) throw new Error('Invalid prefix')

    await Protect.DuplicateCheck(Request.role,'user_id',Request.user.id);

    const result = await (new Query).Insert(Request.role,
        ['user_id', 'prefix', 'fullname', 'age', 'birthday', 'id_card'],
        [Request.user.id,Request.prefix,Request.fullname,Request.age,Request.birthday,Request.id_card]
    );
    response.Result(result);

    return response.Stack();
}

async function ReadArtist(Request){
    const response = new Response();

    await Protect.ValidateRole(await Permission(Request.user,'Read'));
    Request.search_id ? await Protect.ValidateRole(await Permission(Request.user,'ReadOther')):null;

    const result = Request.search_id ? await (new Query).Select('user_id','fullname','age').From('artist').Where('user_id=$1',Request.search_id).Execute() :
    await (new Query).Select('user_id','fullname','age','birthday','id_card').From('artist').Execute()
    response.Result(result);

    return response.Stack();
}

async function ReadOrganize(Request){
    const response = new Response();

    await Protect.ValidateRole(await Permission(Request.user,'Read'));
    Request.search_id ? await Protect.ValidateRole(await Permission(Request.user,'ReadOther')):null;

    const result = Request.search_id ? await (new Query).Select('user_id','fullname','age').From('artist').Where('user_id=$1',Request.search_id).Execute() :
    await (new Query).Select('user_id','fullname','age','birthday','id_card').From('artist').Execute()
    response.Result(result);

    return response.Stack();
}

async function Update(Request){
    const response = new Response();

    await Protect.Validate(Request,['prefix','fullname','age','birthday','id_card','role','band','genre','position'])
    await Protect.ValidateIdCard(Request.id_card);

    const roleMasterData = ['artist','organize']
    const prefixMasterData = ['เด็กชาย','เด็กหญิง','นาย','นาง','นางสาว']

    if(!roleMasterData.includes(Request.role)) throw new Error('Invalid role')
    if(!prefixMasterData.includes(Request.prefix)) throw new Error('Invalid prefix')

    const updateModel = {
        user_id: Request.user.id,
        prefix : Request.prefix,
        fullname : Request.fullname,
        age: Request.age,
        birthday: Request.birthday,
        id_card: Request.id_card,
        band: Request.band,
        genre: `[${Request.genre}]`,
        position: `[${Request.position}]`
    }

    const result = await (new Query).UpdateColumns(Request.role,updateModel,'user_id',Request.user.id);
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
    await new Query().UpdateColumns('artist',updateModel,'user_id',Request.search_id?Request.search_id:Request.user.id);
    const result = await new Query().UpdateColumns('organize',updateModel,'user_id',Request.search_id?Request.search_id:Request.user.id);
    response.Result(result);

    return response.Stack();
}

module.exports = {
    Create,
    ReadArtist,
    ReadOrganize,
    Update,
    Delete,
}
