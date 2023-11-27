const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const ACL = require('../Core/ACL');
const multer = require('multer');
const multerCall = multer();
require('dotenv').config()

// firebase
const admin = require("firebase-admin");
const serviceAccount = {
    type: process.env['auth_provider_x509_cert_url'],
    project_id: process.env['project_id'],
    private_key_id: process.env['private_key_id'],
    private_key: process.env['private_key'],
    client_email: process.env['client_email'],
    client_id: process.env['client_id'],
    auth_uri: process.env['auth_uri'],
    token_uri: process.env['token_uri'],
    auth_provider_x509_cert_url: process.env['auth_provider_x509_cert_url'],
    client_x509_cert_url: process.env['client_x509_cert_url']
}

const FirebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const FirebaseStorage = FirebaseApp.storage();

// class
class Response{
    constructor() {
        this.start_duration = performance.now();
        this.status = 200;
        this.success = true;
        this.duration = performance.now();
        this.response = null;
        this.error_message = [];
        this.disabled = false;
    }
    async Status(status_number){
        if(!this.disabled){
            this.status = status_number;
            return this.status;
        }
    }
    async Success(value){
        if(!this.disabled){
            this.success = value;
            return this.success;
        }
    }
    async Result(res){
        if(!this.disabled){
            if(res.err){
                this.error_message.push(res);
                this.success = false;
                this.status = 500;
                if (this.error_message[0].err.toLowerCase().includes('not found')) this.status = 404;
                return this.error_message; 
            }
            this.response = res;
            return this.response;
        }
    }
    async Error(msg){
        if(!this.disabled){
            this.error_message.push(msg);
            this.success = false;
            this.status = 400;
            
            return this.error_message;     
        }
    }
    async Disabled(){
        return this.disabled = true;
    }
    async Stack(){
        this.duration = performance.now() - this.start_duration;
        const res_form = {
            'status' : this.status,
            'success' : this.success,
            'duration' : this.duration+'ms',
            'response' : this.response,
        }
        if(this.status != 200) res_form['error_message'] = this.error_message;
        return res_form;
    }
}

  

class Query{
    constructor(){
        this.pool = new Pool({
            connectionString: process.env.POSTGRES_URL + "?sslmode=require",
        });
        this.queryParts = [];
        this.values = [];
    }
    // Insert
    async Standard(SQLqueryString){
        let connection; 
        try {
            connection = await this.pool.connect();
            const result = await connection.query(SQLqueryString);
            return result.rows;
        } catch (err) {
            return {err:'database execute',message:err};
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
    async Insert(table,columns,values) {
        let connection; 
        try {
            columns.push(...['isactive','isdelete','created_by']);
            values.push(...[true,false,'Script']);

            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
            const columnsList = columns.join(', ');
            const query = `INSERT INTO ${table} (${columnsList}) VALUES (${placeholders}) RETURNING *`;
            
            connection = await this.pool.connect();
            const result = await connection.query(query, values);
            return result.rows;
        } catch (err) {
            return { err: 'database insert', message: err };
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
    // Query
    Select(...fields) {
        if (fields.length === 0) {
            this.queryParts.push(`SELECT *`);
        } else {
            this.queryParts.push(`SELECT ${fields.join(', ')}`);
        }
        return this;
    }
    From(table) {
        this.queryParts.push(`FROM ${table}`);
        return this;
    }
    Where(condition,...values) {
        this.queryParts.push(`WHERE ${condition} AND isdelete=$2`);
        this.values.push(...values,false);
        return this;
    }
    Wheres(condition,...values) {
        this.queryParts.push(`WHERE ${condition}`);
        this.values.push(...values);
        return this;
    }
    WhereLike(column, value) {
        this.queryParts.push(`WHERE ${column} LIKE $${this.values.length + 1}`);
        this.values.push(`%${value}%`);
        return this;
    }
    async Execute(index=undefined) {
        const queryString = this.queryParts.join(' ');
        let connection; 
        try {
            connection = await this.pool.connect();
            const result = await connection.query(queryString,this.values);
            if(index!==undefined) return result.rows[index];
            return result.rows;
        } catch (err) {
            console.log(err);
            return {err:'database execute',message:err};
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
    async UpdateColumn(table, column, value, condition , condition_value) {
        const queryString = `UPDATE ${table} SET ${column} = $1 WHERE ${condition} = $2 AND isdelete = $3`;
        const values = [value, condition_value , false];
        let connection; 
        try {
            connection = await this.pool.connect();
            const result = await connection.query(queryString, values);
            return result.rowCount;
        } catch (err) {
            console.log(queryString,'/n',values)
            console.log(err)
            return {err:'database execute -UpdateColum',message:err};
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
    async UpdateColumns(table, colums_obj, condition, condition_value) {
        const columns = Object.keys(colums_obj);
        const setClauses = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
        const queryString = `UPDATE ${table} SET ${setClauses} WHERE ${condition} = $${columns.length + 1} AND isdelete = $${columns.length + 2}`;
        const values = [...Object.values(colums_obj), condition_value,false];
        let connection; 

        try {
            connection = await this.pool.connect();
            const result = await connection.query(queryString, values);
            if(result.rowCount>0) return result.rowCount;
            return {err:'Not found'};
        } catch (err) {
            return { err: 'database execute -UpdateColums', message: err };
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

}

function NewObj(obj,select){
    const objResult = {}
    for (let i=0;i<select.length;i++) {
        objResult[select[i]] = obj[select[i]];
    }
    return objResult;
}

async function jwtDecode(req){
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
        return decoded;
    } catch (err) {
        return err.message;        
    }
}

// storage core
async function FileUpload(file) {
    console.log(file)
    if(!file) return {err:'file upload',message:"File missing"};
    const fileURLs = [];
    file.map(async (f) => {
        const storageFile = FirebaseStorage.bucket('gs://imagestorage-afd63.appspot.com').file(`image/${uuidv4()}`);
        const fileStream = storageFile.createWriteStream({
            resumable: false,
            contentType: f.mimetype,
        })

        fileStream.on('finish', async () => {
            await storageFile.getSignedUrl({
                action: 'read',
                expires: '-03-09-9999',
            }).then(share_url => {
                fileURLs.push(share_url);
            })
        });
        fileStream.end(f.buffer);
    })
    console.log(fileURLs)
}
// log
async function Log(msg){
    axios.post(process.env.LOG_SERVER, {
        "msg": msg,
        "by": "Test Server",
        "duration": "Test Duration",
        "create_by": "Script",
    });
}

// acl (permission check)
async function Permission(user,access){
    const userRole = await (new Query()).Select('role').From('users').Where('id=$1',user.id).Execute([0]);
    if (!ACL.Permission[userRole.role]) return false;
    if (ACL.Permission[userRole.role][access]) return true;
    return false;
}

// date time
function GetDateTime(){
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// catch error
async function c(e){
    const r = new Response();
    await r.Error(e.message);
    await r.Status(403);
    return await r.Stack();
}

// check is really have?
async function RefCheck(value_to_check,from_table,condition,condition_value,isArray){
    if(isArray){
        for (i=0;i<condition_value.length;i++){
            const ref = await (new Query).Select(value_to_check).From(from_table).Where(`${condition}=$1`,condition_value[i]).Execute(0);
            if(!ref) throw new Error(`some ${condition} is not found`);
        }
        return true;
    }else{
        const ref = await (new Query).Select(value_to_check).From(from_table).Where(`${condition}=$1`,condition_value).Execute(0);
        if(!ref) throw new Error(`some ${condition} is not found`);
        return true;
    }
}

module.exports = {
    Response,
    Query,
    NewObj,
    jwtDecode,
    FileUpload,
    Log,
    Permission,
    GetDateTime,
    c,
    multerCall,
    RefCheck
};
