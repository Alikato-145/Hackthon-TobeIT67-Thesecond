const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function Hash(string){
    return bcrypt.hash(string,12).then(HashResult=>{
        return HashResult;
    })
}
async function HashCompare(password,hash_password){
    if(!password || !hash_password) return false;
    return await bcrypt.compare(password,hash_password).then(result=>{
        return result;
    })
}

async function DuplicateCheck(table,colum,value) {
    const queryString = `SELECT COUNT(*) FROM ${table} WHERE ${colum} = $1`;
    const values = [value];

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL + "?sslmode=require",
    });
    let connection;
    try {
        connection = await pool.connect();
        const result = await connection.query(queryString, values);
        if(result.rows[0].count > 0){
            throw new Error(`This ${colum} is already in use`);
        }
    } catch (err) {
        throw new Error(err);
    } finally {
        if(connection){
            connection.release();
        }
    }
}

// only validate function
async function ValidateIdCard(p_iPID) {
    if(!p_iPID) throw new Error('Invalid IdCard');
    var total = 0;
    var iPID;
    var chk;
    var Validchk;
    iPID = p_iPID.replace(/-/g, "");
    Validchk = iPID.substr(12, 1);
    var j = 0;
    var pidcut;
    for (var n = 0; n < 12; n++) {
        pidcut = parseInt(iPID.substr(j, 1));
        total = (total + ((pidcut) * (13 - n)));
        j++;
    }

    chk = 11 - (total % 11);

    if (chk == 10) {
        chk = 0;
    } else if (chk == 11) {
        chk = 1;
    }
    if (chk == Validchk) {
        return true;
    } else {
        throw new Error('Invalid IdCard');
    }
}

async function ValidateEmail(email) {
    if(!email) throw new Error('Invalid Email');
    const validRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email.match(validRegex)) {
        return true;
    } else {
        throw new Error('Invalid Email');
    }    
}

async function ValidateUsername(username) {
    if(!username) throw new Error('Invalid Username');
    if (username.length < 8 || username.length > 20) {
        throw new Error('Invalid Username (8-20)');
    }

    let hasLowercase = false;
    let hasUppercase = false;

    for (let i = 0; i < username.length; i++) {
        const char = username.charAt(i);

        if (char >= 'a' && char <= 'z') {
            return hasLowercase = true;
        } else if (char >= 'A' && char <= 'Z') {
            return hasUppercase = true;
        }

        if (hasLowercase && hasUppercase) {
            break;
        }
    }

    const validRegex = /^[a-zA-Z0-9._%+-]+$/;
    if (!username.match(validRegex)) {
        throw new Error('Invalid Username');
    }

    return hasLowercase && hasUppercase;
}

async function ValidatePassword(password) {
    if(!password) throw new Error('Invalid Password');
    if (password.length < 8) {
        throw new Error('Invalid Password (At least 8 characters)');
    }

    let hasLowercase = false;
    let hasUppercase = false;

    for (let i = 0; i < password.length; i++) {
        const char = password.charAt(i);

        if (char >= 'a' && char <= 'z') {
            return hasLowercase = true;
        } else if (char >= 'A' && char <= 'Z') {
            return hasUppercase = true;
        }

        if (hasLowercase && hasUppercase) {
            break;
        }
    }

    const validRegex = /^[a-zA-Z0-9._%+-]+$/;
    if (!password.match(validRegex)) {
        throw new Error('Invalid Password');
    }

    return hasLowercase && hasUppercase;
}

async function ValidateObj(data,response){
    if(!data){
        await response.Error(`undefined / missing parameter`);
        return false;
    };
    
    async function KeyCheck(obj) {
        for (const key in obj) {
            if(obj[key]=='undefined'){
                await response.Error(`undefined / missing parameter in ${key}`);
            }
        }
        for (let key in obj) {
            if (typeof obj[key] == 'object') KeyCheck(obj[key]);
        }
      };

      KeyCheck(data);
    
    return true;
}

async function Validate(request,string_array){
    let stack = []
    for (i=0;i<string_array.length;i++){
        if(request[string_array[i]]==undefined) stack.push('Missing parameter: '+string_array[i])
    }
    if (stack.length > 0) throw new Error(stack)
    return true
}

async function ValidateRole(bool){
    if(!bool) throw new Error('Access Denied');
    return true;
}

async function ValidatePhone(number) {
    var phoneRegex = /^[0-9]{10}$/;
    if(!phoneRegex.test(number)) throw new Error("Invalid Phone")
}

module.exports = {
    Hash,
    HashCompare,
    DuplicateCheck,
    ValidateIdCard,
    ValidateEmail,
    ValidateUsername,
    ValidatePassword,
    ValidateObj,
    Validate,
    ValidateRole,
    ValidatePhone
}