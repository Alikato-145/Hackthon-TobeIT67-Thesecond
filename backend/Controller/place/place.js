const path = require('path');
const express = require('express');
const router = express.Router();
// Core
const Helper = require('../../Core/Helper');
const Protect = require('../../Core/Protect');
const Permission = require('../../Core/ACL');
// Custom Middleware
const {Response,EmailVeriy} = require('../../Middleware/custom');
const Authorize = require('../../Middleware/jwt');
// Service
const Service = require(`../../Service/${path.basename(path.dirname(__filename))}/${path.basename(__filename)}`)

router.get('/read/:id?',Authorize,async (req,res)=>{
    req.body.search_id = req.params.id
    const result = await Service.Read(req.body).catch(e=>Helper.c(e));
    Response(req,res,result);
});

router.post('/create',Authorize,async (req , res) => {
    const result = await Service.Create(req.body).catch(e=>Helper.c(e));
    Response(req,res,result);
})

router.patch('/reserve-approve',Authorize,async (req , res) => {
    const result = await Service.Reserve(req.body).catch(e=>Helper.c(e));
    Response(req,res,result);
})

router.put('/update',Authorize,async (req,res)=>{
    const result = await Service.Update(req.body).catch(e=>Helper.c(e));
    Response(req,res,result);
});

router.patch('/delete/:id?',Authorize,async (req,res)=>{
    req.body.search_id = req.params.id
    const result = await Service.Delete(req.body).catch(e=>Helper.c(e));
    Response(req,res,result);
});

module.exports = router;
