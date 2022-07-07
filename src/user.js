var express = require("express");
let path = require('path');
var app = express();
var UserModel = require('../database/modals/user');
var bcrypt  = require('bcryptjs')
var jwt  = require('jsonwebtoken');

app.get('/register', function (req, res) {
    const error = req.session?.error;
    req.session.error = ""
    // res.sendFile(path.join(__dirname + '/../views/register.html'), {});
    if(req.cookies.access_token){
      return res.redirect('/');
    }
    res.render("register", {error})
});

app.get('/login', function (req, res) {
    const error = req.session?.error;
    req.session.error = ""
    if(req.cookies.access_token){
      return res.redirect('/');
    }
    res.render("login", {error})
});
app.get('/logout', function (req, res) {
  res
  .clearCookie("access_token")
  res
  .clearCookie("user")
  res
  .clearCookie("role")
  res.redirect("/login");
});

app.post('/register',async (req,res)=>{
    try {
        const { email, password, role, name } = req.body;
        if (!(email && password && role && name)) {
            req.session.error = "All inputs are required"
            res.redirect('/register');
        }
    
        const oldUser = await UserModel.findOne({ name });
        const oldUser1 = await UserModel.findOne({ email });
    
        if (oldUser) {
            req.session.error = "User Name Already Exist"
            res.redirect('/register');
        }

        if (oldUser1) {
            req.session.error = "Email Already Exist"
            res.redirect('/register');
        }
    
        encryptedPassword = await bcrypt.hash(password, 10);
    
        const user = await UserModel.create({
          email: email.toLowerCase(), 
          password: encryptedPassword,
          role: role,
          name: name
        });
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        res.redirect('/login');
      } catch (err) {
        console.log(err);
      }
    }
)

app.post('/login',async (req,res)=>{
    try {
        const { email, password, role } = req.body;
    console.log(req.body);
        if (!(email && password && role)) {
            req.session.error = "All inputs are required"
            res.redirect('/login');
        }
        const user = await UserModel.findOne({ email, role});
        if (user && (await bcrypt.compare(password, user.password))) {
            // console.log('11111111111111');
          const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          req.session.isLoggedIn = true;
          res
          .cookie("access_token", token, {
            httpOnly: true,
            secure: false,
          })
          res.cookie("user", user.name, {
            httpOnly: true,
            secure: false,
          })
          res.cookie("role", user.role, {
            httpOnly: true,
            secure: false,
          })
          res.redirect('/');
        } else{
            // console.log('333333333');
            req.session.error = "Invalid Credentials"
            res.redirect('/login');
        }
      } catch (err) {
        // console.log('2222222222');
        console.log(err);
    }
})

module.exports = app;