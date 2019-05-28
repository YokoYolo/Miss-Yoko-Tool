const express     = require('express');
const userRoutes  = express.Router();               
const User        = require ('../models/user')
const passport    = require ('passport')
const bcrypt      = require ('bcryptjs')
const uploadCloud = require("../config/cloudinary")

//SIGN UP
userRoutes.post('/signup',uploadCloud.single('theImage'), (req, res, next) => {
 
   
    const username = req.body.username;
    const password = req.body.password;
    

    if (!username || !password) {
        res.status(400).json({ message: 'Provide username and password' });
        return;
    } //closed
    if (password.length <= 7) {
        res.status(400).json({ message: 'Please make your password longer' });
        return;
    } //closed
    
    User.findOne({ username }, '_id', (err, foundUser) => {
        if (foundUser) {
            res.status(400).json({ message: 'The username already exists' });
            return;
        } //closed
        const salt     = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password, salt);
        const theUser = new User({
            username:username,
            password: hashPass,
            // name:      req.body.name,
            // lastname:  req.body.lastname,
            // email:     req.body.email,
            // image:     req.file.url
        }); //closed

        theUser.save((err) => {
            if (err) {
                res.status(400).json({ message: 'Something went wrong' });
                return;
            } //closed

            req.login(theUser, (err) => {
                if (err) {
                    res.status(500).json({ message: 'Something went wrong' });
                    return;
                } //closed
                res.status(200).json(req.user);
            }); //req.login
        }); //theUser.save 
    }); // User.findOne
}); // userRoutes.post

//UPDATE USER

userRoutes.post('/user/update',uploadCloud.single('theImage'), (req, res, next)=>{
    console.log('body: ', req.body)
    console.log('file: ', req.file)
    const userId = req.user.id;
    const salt     = bcrypt.genSaltSync(10);
    const password = req.body.password;
    const hashPass = bcrypt.hashSync(password, salt);
    User.findByIdAndUpdate(userId, {
        username:  req.body.username,
        password:  hashPass,
        // name:      req.body.name,
        // lastname:  req.body.lastname,
        // email:     req.body.email,
        // image:     req.file.url
    })
    .then((response)=>{
        console.log (response)
        res.json(response)
    })
    .catch ((err)=>{
        next (err);
    })
})

//DELETE USER
userRoutes.post('/user/delete', (req, res, next)=>{
    const userId = req.params.id;
    User.findByIdAndRemove(userId)
    .then((response)=>{
        res.json(response)
    })
    .catch((err)=>{
        next(err);
    })
})

//LOGIN
userRoutes.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, theUser, failureDetails) => {
        console.log('user: ', theUser)
        if (err) {
            res.status(500).json({ message: 'Something went wrong' });
            return;
        }
        if (!theUser) {
            res.status(401).json(failureDetails);
            return;
        }
        req.login(theUser, (err) => {
            if (err) {
                res.status(500).json({ message: 'Something went wrong' });
                return;
            }
        // We are now logged in (notice req.user)
            res.status(200).json(req.user);
        });  // closed login
    })(req, res, next); // closed passport.authenticate
}); //user login

//Check LOGGEDIN
userRoutes.get('/loggedin', (req, res, next) => {
    console.log('back: ', req.user)
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
        return;
    }
    res.status(403).json({ message: 'Unauthorized' });
}); // loggedin closed


//LOGOUT 
userRoutes.post('/logout', (req, res, next) => {
    req.logout();
    res.status(200).json({ message: 'Success' });
});

module.exports = userRoutes;