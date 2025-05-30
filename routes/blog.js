const {Router} = require("express")
const router = Router()
const path = require("path")
const multer = require("multer")
const Blog = require("../models/blog")
const Comment = require("../models/comment")

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.resolve(`./public/uploads/`))
    },
    filename:function(req,file,cb){
        const filename = `${Date.now()}-${file.originalname}`
        cb(null,filename)
    }
})

// File filter function to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
})

// Specific routes first
router.get("/add",(req,res)=>{
    res.render("addBlog",{user:req.user})
})

router.post("/add",upload.single("coverImage"), async(req,res)=>{
    try{
        if (!req.file) {
            return res.status(400).render("addBlog", { 
                user: req.user,
                error: "Please upload an image file"
            });
        }
        const blog = await Blog.create({
            title:req.body.title,
            body:req.body.body,
            coverImageUrl:`/uploads/${req.file.filename}`,
            createdBy:req.user._id
        })
        res.redirect(`/`)
    }catch(err){
        console.log("Error in adding blog",err)
        res.status(400).render("addBlog", { 
            user: req.user,
            error: err.message || "Error uploading file"
        });
    }
})

router.post("/comment/:blogId",async(req,res)=>{
    const comment = await Comment.create({
        content:req.body.content,
        blogId:req.params.blogId,
        createdBy:req.user._id
    })
    res.redirect(`/blog/${req.params.blogId}`)
})

// Parameterized routes last
router.get("/:id",async(req,res)=>{
    const blog = await Blog.findById(req.params.id).populate("createdBy")
    const comments = await Comment.find({blogId:req.params.id}).populate("createdBy")
    if(!blog) return res.redirect("/")
    res.render("blog",{
        blog,
        user:req.user,
        comments
    })
})

module.exports = router