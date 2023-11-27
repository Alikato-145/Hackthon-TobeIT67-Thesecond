const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

const Auth = async (req,res,next) =>{
    const token = await extractToken(req);
    if(!token){
        return res.status(403).send('A token is required');
    }

    try{
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.body.user = decoded;

        const storedTokenResult = await pool.query('SELECT token FROM users WHERE id = $1', [req.body.user.id]);

        if (storedTokenResult.rows.length === 0 || storedTokenResult.rows[0].token !== token) {
            return res.status(401).send("Token that has been retired");
        }
    } catch(err){
        return res.status(401).send("Invalid or Expired Token");
    }
    return next();
}

async function extractToken(req) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
            return tokenParts[1];
        }
    }
    return req.body.token || req.query.token || req.headers['x-access-token'];
}  

module.exports = Auth;
