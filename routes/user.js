const {Router} = require("express")
const User = require("../models/user")
const { validateToken } = require("../services/authentication")
const router = Router()

router.get("/signup",(req,res)=>{
    res.render("signup")
})

router.get("/login",(req,res)=>{
    res.render("login")
})

router.post("/signup",async(req,res)=>{
    const {fullName,email,password} = req.body
    const user = await User.create({fullName,email,password})
    res.redirect("/user/login")
})

router.post("/login",async(req,res)=>{
    try {
        const {email,password} = req.body
        const token = await User.matchPasswordAndGenerateToken(email,password)
        res.cookie("token", token)
        res.redirect("/")
    } catch (error) {
        error.message = "Invalid email or password"
        console.error("Login error:", error.message)
        res.render("login",{error:error.message})
    }
})

router.get("/logout",(req,res)=>{
    res.clearCookie("token")
    res.redirect("/")
})

// Add a middleware to check authentication
const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.token
    if (!token) return res.redirect("/user/login")
    
    try {
        const user = validateToken(token)
        req.user = user
        next()
    } catch (error) {
        res.clearCookie("token")
        return res.redirect("/user/login")
    }
}

module.exports = { router, isAuthenticated }