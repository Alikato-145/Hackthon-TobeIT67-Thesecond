const path = require('path');
const express = require('express');
const router = express.Router();
// Core
const Helper = require('../../Core/Helper');
const Protect = require('../../Core/Protect');
const Permission = require('../../Core/ACL');
// Custom Middleware
const {Response} = require('../../Middleware/custom');
const Authorize = require('../../Middleware/jwt');
// Service
const Service = require(`../../Service/${path.basename(path.dirname(__filename))}/${path.basename(__filename)}`);

router.post('/login',async (req,res)=>{
    const result = await Service.Login(req.body).catch(e=>Helper.c(e));
    Response(req,res,result);
});

router.post('/refreshToken',async (req, res) => {
    const result = await Service.RefreshToken(req).catch(e=>Helper.c(e));
    Response(req,res,result);
});


router.get('/test',Authorize,async (req,res)=>{
    Helper.jwtDecode(req).then(res=>{
        console.log('decode: ',res);
    })
    const result = "work"
    Response(req,res,result);
});

module.exports = router;
