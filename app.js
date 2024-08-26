const express= require('express');
const app= express();
const jwt= require('jsonwebtoken');
const path= require('path');
const bcrypt= require('bcrypt');
const cookieParser = require('cookie-parser');
const port = 3000;
const fs = require('node:fs');

//models imported
const userModel= require('./models/user');
const postModel= require('./models/post');
const isLoggedIn= require('./middlewares/logInCheck');
const { log, profile } = require('console');
const upload = require('./multer/multer')
const { ObjectId } = require('mongodb');



app.set('view engine','ejs')
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

app.get('/',(req,res)=> {
    res.render("losi",{flag:true, result:true,});
})
app.get('/test',(req,res)=> {
    res.render("dating");
})
app.get('/myprofile',isLoggedIn,async (req,res)=> {
    const email = req.user.email;
    const user =await userModel.findOne({email});
    const pass =  user.ProfilePass;
    const jwt_main = req.cookies.ProfileName;
    const jwt_seondform = req.cookies.PhNumber;
    const jwt_thirdform = req.cookies.BioContent;
    if(jwt_main=='' || jwt_seondform==''  || jwt_thirdform=='' ){
        if(pass==0){
        res.redirect('/editprofile');
    }
    else {
        const email= req.user.email;
        const users = await userModel.findOne({email}).populate('posts');
        const updatedUser =await userModel.findOne({email:`${req.user.email}`});
        if(updatedUser){
            const name=updatedUser.ProfileName;
            const age=updatedUser.Age;
            const lookingFor=updatedUser.LookingFor;
            const profileName=updatedUser.ProfileName;
            const relationship=updatedUser.RelationshipStatus;
            const favSong=updatedUser.FavSong;
            const gender=updatedUser.Gender;
            const hobby=updatedUser.Hobby;
            const phNumber=updatedUser.PhNumber;
            const religion=updatedUser.Religion;
            const BioContent = updatedUser.BioContent;
            const QuoteContent = updatedUser.QuoteContent;
            const education=updatedUser.Educaion;
            const profilePic = updatedUser.profilepic;
            res.render("myprofile",{name,lookingFor,profileName,gender,hobby,religion,favSong,relationship,age,education,BioContent,QuoteContent,profilePic,phNumber,users});
        }
        }
}
    else {
        const email= req.user.email;
        const users = await userModel.findOne({email}).populate('posts');
        const updatedUser =await userModel.findOne({email:`${req.user.email}`});
        if(updatedUser){
            const name=updatedUser.ProfileName;
            const age=updatedUser.Age;
            const email=updatedUser.email;
            const lookingFor=updatedUser.LookingFor;
            const profileName=updatedUser.ProfileName;
            const relationship=updatedUser.RelationshipStatus;
            const phNumber=updatedUser.PhNumber;
            const favSong=updatedUser.FavSong;
            const gender=updatedUser.Gender;
            const hobby=updatedUser.Hobby;
            const religion=updatedUser.Religion;
            const BioContent = updatedUser.BioContent;
            const QuoteContent = updatedUser.QuoteContent;
            const education=updatedUser.Educaion;
            const profilePic = updatedUser.profilepic;

            res.render("myprofile",{name,lookingFor,profileName,gender,hobby,religion,favSong,relationship,age,education,BioContent,QuoteContent,profilePic,phNumber,users});
        }
        }
})
app.get('/editprofile',isLoggedIn,async (req,res)=> {
    const email = req.user.email ;
    const jwt_main = req.cookies.ProfileName;
    const jwt_seondform = req.cookies.PhNumber;
    const jwt_thirdform = req.cookies.BioContent;
    if(jwt_main!=='' && jwt_seondform!==''  && jwt_thirdform!=='' ){
        await userModel.findOneAndUpdate({email},{ProfilePass:"1"},{new:true});
    }
    const user = await userModel.findOne({email});
    const profileName = user.ProfileName;
    const profilepass = user.ProfilePass;
    const age = user.Age;
    const phNumber = user.PhNumber;
    const favSong = user.FavSong;
    const bioContent = user.BioContent;
    const quoteContent = user.QuoteContent;

    res.render("editprofile",{profileName,age,phNumber,favSong,bioContent,quoteContent,profilepass});      
})
app.get('/main',isLoggedIn,(req,res)=> {
    res.render("test");
})
app.get('/logout',isLoggedIn,(req,res)=> {
    res.cookie("token",'');
    res.cookie("PhNumber",'');
    res.cookie("BioContent",'');
    res.cookie("ProfileName",'');
    res.redirect('/');
})
app.post('/signup',async (req,res)=> {
    let{fullName,email,password}= req.body ;
    let user =await userModel.findOne({email});
    let allUser =await userModel.find();
    if(!user){
    bcrypt.genSalt(10, function(err,salt){
     bcrypt.hash(password,salt,async function(err,hash){
        let createdUser =await userModel.create({
            Name : fullName,
            email:email,
            password: hash,
        })
        const token = jwt.sign({email:email,user_id:createdUser._id},"shhh");
        res.cookie("token",token);
        res.cookie("PhNumber",'');
        res.cookie("BioContent",'');
        res.cookie("ProfileName",'');
        const flag = true ;
        res.redirect('/main');
     })
    })
}
  else {
    const flag = false ;
    const result=true;
    res.render('losi',{flag,result});
  }

})
app.post('/login',async (req,res)=> {
    let{email,password}= req.body ;
    let user =await userModel.findOne({email});
    let allUser =await userModel.find();
    if(user){
        const hash = user.password ;
        bcrypt.compare(password,hash,function(err,result){
            if(result==true){
            const token = jwt.sign({email:email,user_id:user._id},"shhh");
            res.cookie("token",token);
            res.cookie("PhNumber",'');
            res.cookie("BioContent",'');
            res.cookie("ProfileName",'');
            const result= true ;
            res.redirect('/main');
              }
            else{
                const result = false ;
                const flag = true;
                res.render('losi',{result:result,flag});
            }
        })
}
  else {
    const result = false ;
    const flag = true;
    res.render('losi',{result:result,flag}); 
 }

})
app.post('/main', isLoggedIn, async (req, res) => {
    let { name, age, relationship, education, lookingFor } = req.body;
    let email = req.user.email;

        const user = await userModel.findOne({ email: email });
        
        if (user) {
            const mainUpdate = await userModel.findOneAndUpdate(
                { email },
                {
                    ProfileName: name,
                    Age: age,
                    RelationshipStatus: relationship,
                    Educaion: education, // Corrected typo here
                    LookingFor: lookingFor,
                },
                { new: true }
            );

            if (mainUpdate) {
                console.log('Updated Main Successfully');
                res.cookie("ProfileName","");
                const token = jwt.sign({ ProfileName: name }, "shhhh");
                res.cookie("ProfileName", token);
                res.redirect('/editprofile');
            }   
        } 
});
app.post('/secondForm', isLoggedIn,async (req,res)=>{
    const{phNumber,favSong,gender,hobby,religion,} = req.body;
    const email= req.user.email;
    console.log(religion);
    const user =await userModel.findOne({email});
    if(user){
        const mainUpdate =await userModel.findOneAndUpdate({email},{ 
            FavSong:favSong,
            Gender:gender,
            PhNumber:phNumber,
            Hobby:hobby,
            Religion:religion,},
            { new: true });
        console.log('About Updated Sucessfully');
        await user.save();
        const token = jwt.sign({PhNumber:phNumber},"shhhh");
        res.cookie("PhNumber",'');
        res.cookie("PhNumber",token);
        res.redirect('/editprofile');
    }
})          
app.post('/thirdForm', isLoggedIn,async (req,res)=>{
    const{bioContent,quoteContent,} = req.body;
    const email= req.user.email;
    const user =await userModel.findOne({email:`${req.user.email}`});
    if(user){
        const mainUpdate =await userModel.findOneAndUpdate({email:`${req.user.email}`},
            { 
            BioContent:bioContent,
            QuoteContent:quoteContent,},
            { new: true });
        console.log('Bio Updated Sucessfully');
        await user.save();
        const token = jwt.sign({BioContent:bioContent},"shhhh");
        res.cookie("BioContent",'');
        res.cookie("BioContent",token);
        res.redirect('/editprofile');
        const updatedUser =await userModel.findOne({email:`${req.user.email}`});

    }
})
app.post('/searchuser', isLoggedIn,async (req,res)=>{
    const{search}= req.body;
    const emailUser = req.user.email;
    const updatedUser = await userModel.findOne({ProfileName:search});
    const actualUser = await userModel.findOne({email:req.user.email});
    if(updatedUser){
        const name=updatedUser.Name;
        const age=updatedUser.Age;
        const email=updatedUser.email;
        const lookingFor=updatedUser.LookingFor;
        const profileName=updatedUser.ProfileName;
        const relationship=updatedUser.RelationshipStatus;
        const favSong=updatedUser.FavSong;
        const gender=updatedUser.Gender;
        const phNumber=updatedUser.PhNumber;
        const hobby=updatedUser.Hobby;
        const religion=updatedUser.Religion;
        const BioContent = updatedUser.BioContent;
        const QuoteContent = updatedUser.QuoteContent;
        const education=updatedUser.Educaion;
        const profilePic = updatedUser.profilepic;
        const users = await userModel.findOne({email}).populate('posts');
            if(email==emailUser){
                res.redirect('/myprofile');
            }
            else{
            res.render("userProfile",{name,lookingFor,profileName,gender,hobby,religion,favSong,relationship,age,education,BioContent,QuoteContent,profilePic,phNumber,users,actualUser});
             }
        }

    else{
        res.send("User with the name is not found!")
    }
})
app.get('/uploadprofile',isLoggedIn,(req,res)=>{
    res.render('uploadprofile');
})
app.post('/upload', upload.single('file'), isLoggedIn, async function (req, res) {
     const email =req.user.email ;
     const user = await userModel.findOne({email});
     const fn = user.profilepic;
     if(fn!="default_user.jpg"){
       fs.unlink(`./public/images/profilePictures/${fn}`,(err)=>{
        if(err) throw(err);
        else console.log('preve profile deleted and new is uploaded!');
       })
     }
     user.profilepic = req.file.filename;
     await user.save();
     res.redirect('/myprofile');
  })
app.get('/deleteprofile',isLoggedIn,async function (req, res) {
     const email =req.user.email ;
     const user = await userModel.findOne({email});
     const fn = user.profilepic;
     if(fn!="default_user.jpg"){
       fs.unlink(`./public/images/profilePictures/${fn}`,(err)=>{
        if(err) throw(err);
        else console.log('Profile Picture deleted!');
       })
     }
     user.profilepic ='default_user.jpg';
     await user.save();
     res.redirect('/myprofile');
  })
app.post('/createPost',isLoggedIn,async function (req, res) {
     const email =req.user.email ;
     const Text  =req.body.mindPost;
     const users= await userModel.findOne({email});
     const postCreated =  await postModel.create({
        Text:Text,
        ProfileName:users.ProfileName,
        user:users._id ,
     })
     if(postCreated) console.log('post created!');
     users.posts.push(postCreated._id);
     await users.save();
     res.redirect('/myprofile')
  })
app.get('/delete/:postId',isLoggedIn,async function (req, res) {
  const deletedPost =await postModel.findOneAndDelete({_id:req.params.postId});
  res.redirect('/myprofile');
})
app.get('/edit/:postId',isLoggedIn,async function (req, res) {
  email = req.user.email ;
  const post = await postModel.findOne({_id:req.params.postId});
  const prevContent = post.Text;
  res.render('editPost',{id:req.params.postId,prevContent});
})
app.post('/edit',isLoggedIn,async function (req, res) {
    let{newContent} =req.body ; 
    const id = req.body.id ;
    
    const editedPost =await postModel.findOneAndUpdate({_id:id},{Text:newContent});
    res.redirect('/myprofile');
})
app.get('/reload', (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          window.location.reload();
        </script>
      </body>
    </html>
  `);
});
app.get('/like/:postId',isLoggedIn,async function (req, res) {
  const post = await postModel.findOne({_id:req.params.postId}).populate('user');
//   console.log(req.user.user_id);
  const userId = req.user.user_id;  //logged in user's id

// Function to safely create an ObjectId
function createObjectId(id) {
  try {
    // Ensure the input is a string and is a valid 24-character hex
    if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
      return new ObjectId(id);
    } else {
      console.error('Invalid ObjectId format:', id);
      return null;
    }
  } catch (error) {
    console.error('Error creating ObjectId:', error.message);
    return null;
  }
}
const idToDelete = createObjectId(userId);
  if(post.likes.indexOf(idToDelete)=== -1){
post.likes.push(req.user.user_id);
console.log('like added');
  }
  else{
    post.likes.splice(post.likes.indexOf(idToDelete),1);
    console.log('like removed')
  }
  await post.save();
})
app.listen(3000);