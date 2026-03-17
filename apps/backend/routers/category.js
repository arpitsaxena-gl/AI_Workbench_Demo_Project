const express = require('express');
const router = express.Router();
const Category = require('../model/category');
console.log(Category);
router.get(`/`,async (req,res)=>{
    console.log(Category);
    const category = await Category.find();
    if(!category){
        res.status(500).json({success:false,message:"no record found for categories"});
    }
    return res.status(200).send(category);
})

router.post(`/`,(req,res)=>{
    const category = new Category({ 
        name : req.body.name,
        icon:req.body.icon,
        color : req.body.color
    })
    category.save().then((createProduct)=>{
        return res.status(201).json(createProduct)
    }).catch((e)=>{
        return res.status(500).json({
            error : e,
            success : false
        })
    })
})
//api/v1/idtoDelete
router.delete(`/:id`,(req,res)=>{
    Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category){
            return res.status(200).json({success:true,message:"category deletd"});
        }else{
            return res.status(404).json({success:false,message:"not found"})
        }
    }).catch(err=>{

      return res.status(404).json({success:false});
    })

})

router.put('/:id',async(req,res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,{
        name : req.body.name,
        icon:req.body.icon,
        color : req.body.color
        },{new:true}
    )
    if(!category){
        res.status(500).json({success:false,message:"no record found for categories"});
    }
    res.status(200).json({success:false,message:"no record found ",data:category});
})

module.exports = router;