var express = require('express');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = 'CLIENT_ID';
var CLIENT_SECRET = 'CLIENT_SECRET';
var REDIRECT_URL = 'http://127.0.0.1:3000/auth/google/callback';

var oauth2Client = new OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URL);

passport.use(new GoogleStrategy({
      clientID:CLIENT_ID,
      clientSecret:CLIENT_SECRET,
      callbackURL:REDIRECT_URL
    },
    function(accessToken,refreshToken,profile,done){

      oauth2Client.setCredentials({access_token:accessToken});
      //console.log(typeof oauth2Client.credentials);
      //console.log(profile);
      process.nextTick(function(){
        return done(null,profile);
      });

    }));

router.get('/layout',function(req,res){
  res.render('layout',{user:req.user});
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Google',user:req.user });
});

router.get('/auth/google',passport.authenticate('google',{scope:['profile','email','https://www.googleapis.com/auth/gmail.readonly']}),function(req,res){
  //console.log(req);
  res.status(200).json({message:'nothing'});
});

router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),
  function(req,res){
    //console.log(req);
      res.render('account',{user:req.user});
      //res.redirect('/layout');
    });

router.get('/login',function(req,res){
  res.render('login');
});

router.get('/account',function(req,res,next){

  if(req.isAuthenticated()){return next()}
  res.redirect('/login');
},function(req,res){
  res.render('account',{user:req.user});
});

router.get('/email',function(req,res){
   var gmail = google.gmail('v1');
   gmail.users.messages.list({
     userId:'me',
     auth:oauth2Client
   },function(err,response){
     res.render('email',{result:response.resultSizeEstimate});
   })
});


module.exports = router;
