const mongoose=require("mongoose")
const bcrypt = require("bcrypt");

mongoose.connect(`${process.env.MONGODB_URL}`)
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log("failed");
})



const newSchema =new mongoose.Schema({
    Name:{
       type: String,
       required:true
    },
    gender: {  
        type: String,
        required: true,
      },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    Dob:{
        type:Date,
        required:true
    }
})
newSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;

    next();
});

const collection = mongoose.model("collection",newSchema)

module.exports=collection