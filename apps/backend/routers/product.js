const express = require('express');
const router = express.Router();
const Product = require('../model/product');
console.log(Product);
const Category = require('../model/category');
const mongoose = require('mongoose');
router.get(`/`,async (req,res)=>{
    console.log(Product);
    let filter = {};
    if(req.query.category){
        filter = {category:req.query.category.split(",")}
    }
    const product = await Product.find(filter).populate("category");
    return res.send(product);
})

router.get(`/:id`,async (req,res)=>{
    console.log(Product);
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
      return res.status(500).json({success: false})
    }

   return res.send(product);
})

router.post(`/`,async (req,res)=>{
    let category = await Category.findById(req.body.category);
    console.log("category "+category);
    if(!category){
        return res.status(400).send("invalid category");
    }
    const product = new Product({
        name : req.body.name,
        description : req.body.description,
        richDescription : req.body.richDescripiton,
        image: req.body.image,
        brand : req.body.brand,
        price : req.body.price,
        category : req.body.category,
        countInStock : req.body.countInStock,
        rating : req.body.rating,
        numReviews : req.body.numReviews,
        isFeatured : req.body.isFeatured

    })
    product.save().then((createProduct)=>{
        return res.status(201).json(createProduct)
    }).catch((e)=>{
        return res.status(500).json({
            error : e,
            success : false
        })
    })
})

router.put(`/:id`,async (req,res)=>{
    console.log(Product);
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send("Invalid product");
    }
    let category = await Category.findById(req.body.category);
    console.log("category "+category);
    if(!category){
        return res.status(400).send("invalid category");
    }
    const product = await Product.findByIdAndUpdate(
    req.params.id,{
        name : req.body.name,
        description : req.body.description,
        richDescription : req.body.richDescripiton,
        image: req.body.image,
        brand : req.body.brand,
        price : req.body.price,
        category : req.body.category,
        countInStock : req.body.countInStock,
        rating : req.body.rating,
        numReviews : req.body.numReviews,
        isFeatured : req.body.isFeatured

        },{new:true})
    if(!product){
      return res.status(500).json({success: false})
    }

   return res.send(product);
})


router.delete(`/:id`,(req,res)=>{
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success:true,message:"product deletd"});
        }else{
            return res.status(404).json({success:false,message:"not found"})
        }
    }).catch(err=>{

      return res.status(404).json({success:false});
    })

})

router.get('/get/count',async(req,res)=>{
    const productCount = await Product.countDocuments({})
    if(!productCount){
        res.status(500).json({success:false})
    }
    return res.send({productCount:productCount});
})

router.get('/get/featured/:count',async(req,res)=>{
    const count = req.params.count?req.params.count:0;
    const products = await Product.find({"isFeatured":true}).limit(+count);
    if(!products){
        res.status(500).json({success:false})
    }
    return res.send(products);
})

module.exports = router;