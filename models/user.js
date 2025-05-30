const{createHmac,randomBytes} = require("crypto")
const {createTokenForUser,validateToken} = require("../services/authentication")
const {Schema,model} = require("mongoose")

const  userSchema = new Schema({
  fullName:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  salt:{
    type:String,
  },
  password:{
    type:String,
    required:true,
  },
  profileImageUrl:{
    type:String,
    default:"/images/default.webp"
  },
  role:{
    type:String,
    enum:["USER","ADMIN"],
    default:"USER"
  }
},{timestamps:true})

userSchema.pre("save",function(next){
  const user = this

  if(!user.isModified("password")) return 

  const salt = randomBytes(16).toString("hex")
  const hashPassword = createHmac("sha256",salt).update(user.password).digest("hex")

  user.password = hashPassword
  user.salt = salt

  next()
})

userSchema.static("matchPasswordAndGenerateToken",async function(email,password){
  const user = await this.findOne({email})

  if(!user) throw new Error("User not found")  

  const salt = user.salt
  const hashPassword=user.password
  const userProvidedHash = createHmac("sha256",salt).update(password).digest("hex")

  if(hashPassword !== userProvidedHash) throw new Error("Invalid password")

  const token = createTokenForUser(user)
  return token
})

const User = model("User",userSchema)
module.exports = User