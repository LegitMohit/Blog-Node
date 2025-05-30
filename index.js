const path = require("path");
const express = require("express");
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const {checkForAuthenticationCookie} = require("./middlewares/authentication")
const { router: userRouter, isAuthenticated } = require("./routes/user")
const blogRouter = require("./routes/blog")
const Blog = require("./models/blog")

const app = express();
const port = 8003;

mongoose.connect("mongodb://localhost:27017/bloghere", {
    authSource: "admin",
    auth: {
        username: "admin",  // Replace with your MongoDB username
        password: "qwerty"   // Replace with your MongoDB password
    }
}).then(() => {
    console.log("MongoDB connected successfully")
}).catch((err) => {
    console.error("MongoDB connection error:", err)
})

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static(path.resolve("./public")))
app.use(checkForAuthenticationCookie("token"))

app.use("/user", userRouter)
app.use("/blog", blogRouter)

app.get("/", async(req, res) => {
    const allBlogs = await Blog.find({}).sort({createdAt: -1})
    res.render("home", { 
        user: req.user,
        blogs:allBlogs
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


