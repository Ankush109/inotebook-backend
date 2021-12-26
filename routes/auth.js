const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');


const JWT_SECRET = 'Harryisagoodb$oy';

// Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => { 
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    });
    const data = {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    

    // res.json(user)
    res.json({authtoken})
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured");
  }
})
//authenticate a user using post "/api/auth/login" 
router.post('/login', [
  body('password', 'password cannot be blanked').exists(),
  body('email', 'Enter a valid email').isEmail(),
  
], async (req, res) => {
  //if there are any errors return the bad request and the errors:-
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email,password} =req.body;
  try {
    let user =await User.findOne({email})
    if(!user){
      return res.status(400).json({error:"please try to login with the correct credentials"})
    }
    const passwordcompare = await bcrypt.compare(password,user.password);
    if(!passwordcompare){
      return res.status(400).json({error:"please try to login with the correct credentials"})
    }
    const data = {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({authtoken})
    

  } catch (error) {
 
      console.error(error.message);
    res.status(500).send("Some Error occured");
    
  }
})
//get loggined in user details using post '/api/aith/getuser" .login required
router.post('/getuser', fetchuser, async (req, res) => {
try {
  userid=req.user.id;
  const user =await User.findById(userid).select("-password");
  res.send(user)
  
} catch (error) {
  console.log(error.message);
  res.status(500).send("internal server error")
}
})
module.exports = router