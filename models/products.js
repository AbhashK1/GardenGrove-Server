const mongoose=require('mongoose')

const ProductSchema = new mongoose.Schema({
    title:String,
    dprice:String,
    oprice:String,
    url:String,
    amount:String
})

const ProductModel= mongoose.model("products", ProductSchema)
module.exports=ProductModel