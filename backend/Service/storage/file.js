// Core
const {Response,FileUpload} = require('../../Core/Helper');
const Protect = require('../../Core/Protect');

async function Upload(request){
    const response = new Response();
    await Protect.ValidateObj(request.files,response)

    if(!response.success) return response.Stack();
    
    const result = FileUpload(request.files);
    response.Result(result);

    return response.Stack();
}

module.exports = {
    Upload
}
 