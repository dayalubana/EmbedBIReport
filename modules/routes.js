module.exports.init = function (app, __dirname, passport) {
    
    //authorize the routes  using passport
    if (passport){

        app.use('/login', passport.authorize);

        //route handler for the post authentication from identity provider
        app.get('/onauth', passport.login(),
            function(req,res){
                login(req,res);   
            } 
        ); 
    
      
    }
    
    //add the route for login/out handlers    
    app.get('/login', login)
    app.get('/logout', logout)

    //login
    function login (req, res){
        res.sendFile( __dirname + "/app/index.html");
    }  
    
    // logout
    function logout (req, res) {
        req.logout();
        req.session.destroy();
        res.redirect('/');                
    }
 
};