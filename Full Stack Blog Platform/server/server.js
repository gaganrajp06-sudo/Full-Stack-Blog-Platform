require("dotenv").config();
const express=require("express"), mongoose=require("mongoose"), cors=require("cors"), bcrypt=require("bcryptjs"), jwt=require("jsonwebtoken");
const app=express(); app.use(cors()); app.use(express.json());

const User=mongoose.model("User",new mongoose.Schema({name:String,email:{type:String,unique:true},password:String},{timestamps:true}));
const Post=mongoose.model("Post",new mongoose.Schema({title:String,content:String,author:{type:mongoose.Schema.Types.ObjectId,ref:"User"}},{timestamps:true}));

function auth(req,res,next){try{const token=req.headers.authorization?.split(" ")[1];req.user=jwt.verify(token,process.env.JWT_SECRET);next()}catch(e){res.status(401).json({message:"Unauthorized"})}}

app.post("/api/auth/register",async(req,res)=>{try{
 const {name,email,password}=req.body; if(!name||!email||!password)return res.status(400).json({message:"All fields required"});
 const exists=await User.findOne({email}); if(exists)return res.status(400).json({message:"Email already registered"});
 const user=await User.create({name,email,password:await bcrypt.hash(password,10)});
 const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"}); res.json({token});
}catch(e){res.status(500).json({message:e.message})}});

app.post("/api/auth/login",async(req,res)=>{try{
 const user=await User.findOne({email:req.body.email}); if(!user||!(await bcrypt.compare(req.body.password,user.password)))return res.status(401).json({message:"Invalid credentials"});
 res.json({token:jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"})});
}catch(e){res.status(500).json({message:e.message})}});

app.get("/api/posts",async(req,res)=>res.json(await Post.find().populate("author","name").sort({createdAt:-1})));
app.post("/api/posts",auth,async(req,res)=>{const p=await Post.create({title:req.body.title,content:req.body.content,author:req.user.id});res.status(201).json(p)});
app.put("/api/posts/:id",auth,async(req,res)=>{const p=await Post.findOneAndUpdate({_id:req.params.id,author:req.user.id},req.body,{new:true});res.json(p)});
app.delete("/api/posts/:id",auth,async(req,res)=>{await Post.findOneAndDelete({_id:req.params.id,author:req.user.id});res.json({message:"Deleted"})});

mongoose.connect(process.env.MONGO_URI).then(()=>app.listen(process.env.PORT||5000,()=>console.log("API running on 5000")));