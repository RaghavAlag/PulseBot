const User = require("../models/user")

async function handleCreatingUser(req,res) {
    if(!req.body.name || !req.body.email || !req.body.password){
        console.log("Randi")
        return res.redirect("/signup")
    }
    await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    })
    return res.redirect("/login")
}

 async function handleLoginUser(req,res){
    let user = await User.findOne({email:req.body.email,password:req.body.password})
    if(!user){
        return res.status(404).json({msg:"Invalid Credentials"})
    }
    return res.json({msg:"Entered"})
 }

module.exports = {
    handleCreatingUser,
    handleLoginUser
}