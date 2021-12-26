// const express = require('express');
// const router = express.Router();
// const Notes = require('../models/Notes');
// const fetchuser = require('../middleware/fetchuser'); 
// const { body, validationResult } = require('express-validator');
// //get all the notes using get:"/api.auth/getallnotes"
// router.get('/fetchallnotes',fetchuser ,async (req, res)=>{
//     const notes =await Notes.find({user:req.user.id});
//     res.json(notes)
 
// } )
// //add a note using post "/api/auth/addnote"
// router.post('/addnote',fetchuser ,[
//     body('title', 'Enter a valid title').isLength({ min: 3 }),
//     body('description', 'Enter a valid description').isEmail(),
   
//   ], async (req, res) => { 
//     try {
      
  
//       const{title,description,tag} =req.body
//       // If there are errors, return Bad request and the errors
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//     const note =new Notes({
//         title,description,tag,user:req.user.id

//     })
//     const savednote =await  note.save();
//     res.json(savednote)
//   } catch (error) { 
      
//   }
// } )

// module.exports = router

const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser'); 
const { body, validationResult } = require('express-validator');
// ROUTE 1: Get All the Notes using: GET "/api/auth/getuser". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Add a new Note using: POST "/api/auth/addnote". Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {

            const { title, description, tag } = req.body;

            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Notes({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()

            res.json(savedNote)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })
//route 3:- update an existing note "/api/auth/updatenote" .login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  const {title,description,tag} =req.body;
  //create a newnote object:-
  const newnote ={}
  if(title){newnote.title =title};
  if(description){newnote.description =description};
  if(tag){newnote.tag =tag};
//find the note to be updated 
let note = await Notes.findById(req.params.id)
if(!note){
 return  res.status(404).send("not found");
}
if(note.user.toString() !== req.user.id){
  return  res.status(401).send("not allowed");
}
note =await Notes.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true})
res.json({note})

  })
  //route 4:- delete  an existing note "/api/auth/updatenote" .login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    const {title,description,tag} =req.body;

  //find the note to be deleted 
  let note = await Notes.findById(req.params.id)
  if(!note){
   return  res.status(404).send("not found");
  }
  //allow deletion if user owns this noteS
  if(note.user.toString() !== req.user.id){
    return  res.status(401).send("not allowed");
  }
  note =await Notes.findByIdAndDelete(req.params.id)
  res.json("success note has been deleted")
})
module.exports = router 