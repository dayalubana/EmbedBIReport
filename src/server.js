"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
var env = require('dotenv').config();
let embedToken = require(__dirname + '/embedConfigService.js');
const utils = require(__dirname + "/utils.js");
const passport_azure_ad_1 = __importDefault(require("passport-azure-ad"));
const passport_1 = __importDefault(require("passport"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_validator_1 = __importDefault(require("express-validator"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const secrets_1 = require("./secret");
const passport_2 = __importDefault(require("./passport"));
const OIDCStrategy = passport_azure_ad_1.default.OIDCStrategy;
const cookieParser = require("cookie-parser");
var jwt  = require('jsonwebtoken');
var db = require('../database/db');
var response = require('../data/powerBI').module
var usersData = require('../data/user').module

passport_1.default.serializeUser(function (user, done) {
    done(null, user.oid);
});
passport_1.default.deserializeUser(function (oid, done) {
    findByOid(oid, function (err, user) {
        done(err, user);
    });
});
var users = [];
var findByOid = function (oid, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.oid === oid) {
            return fn(null, user);
        }
    }
    return fn(null, null);
};
passport_1.default.use(new OIDCStrategy({
    identityMetadata: passport_2.default.creds.identityMetadata,
    clientID: passport_2.default.creds.clientID,
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: passport_2.default.creds.redirectUrl,
    allowHttpForRedirectUrl: true,
    clientSecret: passport_2.default.creds.clientSecret,
    validateIssuer: true,
    isB2C: false,
    issuer: '',
    passReqToCallback: false,
    scope: '',
    loggingLevel: 'error',
    nonceLifetime: 0,
    nonceMaxAmount: 5,
    useCookieInsteadOfSession: true,
    cookieEncryptionKeys: [
        { 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
        { 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
    ],
}, function (iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.oid) {
        return done(new Error('No oid found'), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
        findByOid(profile.oid, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                // "Auto-registration"
                users.push(profile);
                return done(null, profile);
            }
            return done(null, user);
        });
    });
}));
// Create a new express application instance
const app = express();
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_validator_1.default());
app.use(cookie_parser_1.default());
app.use(express_session_1.default({
    resave: true,
    saveUninitialized: true,
    secret: secrets_1.SESSION_SECRET
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
// CORS  
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', secrets_1.URL_FRONTEND);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use('/js', express.static('./node_modules/bootstrap/dist/js/')); // Redirect bootstrap JS
app.use('/js', express.static('./node_modules/jquery/dist/')); // Redirect JS jQuery
app.use('/js', express.static('./node_modules/powerbi-client/dist/')) // Redirect JS PowerBI
app.use('/css', express.static('./node_modules/bootstrap/dist/css/')); // Redirect CSS bootstrap
app.use('/public', express.static('./public/')); // Use custom JS and CSS files

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}
;
app.get('/islogin', function (req, res, next) {
    res.send(req.isAuthenticated());
    next();
});
app.get('/login', function (req, res, next) {
    passport_1.default.authenticate('azuread-openidconnect', {
        failureRedirect: '/fail',
    })(req, res, next);
}, function (req, res) {
    res.redirect('/');
});
app.post('/callback', function (req, res, next) {
    passport_1.default.authenticate('azuread-openidconnect', {
        failureRedirect: '/callbackfail',
    })(req, res, next);
}, function (req, res) {
    // req.user._json.name = 'Swatantra Parmar';
    let filteredUser = usersData.filter((user)=>{
        if(user.name==req.user._json.name.split(' ').join('_')){
            return user;
        }
    })
    if(filteredUser.length>0){
        res
        .cookie("user", filteredUser[0].name, {
        httpOnly: true,
        secure: false,
        })
        res
        .cookie("role", filteredUser[0].role, {
        httpOnly: true,
        secure: false,
        })
    }
    const token = jwt.sign(
        { oid: req.user.oid },
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h",
        }
    );
    res
    .cookie("access_token", token, {
    httpOnly: true,
    secure: false,
    })
    res.redirect('/');
});
app.get('/account', ensureAuthenticated, function (req, res) {
    res.send(req.user);
});
app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        req.logOut();
        res.redirect(passport_2.default.destroySessionUrl);
    });
});
app.use(express.static(path_1.default.join(__dirname, './../public'), {
    setHeaders(res) {
        res.setHeader('Cache-Control', 'public,no-cache');
    }
}));
app.get('/api', function (req, res) {
    res.send('Server is started!');
});

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.redirect("/login");
    }
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        if(decoded&&decoded.oid==req.user.oid){
            return next();
        } else{
            return res.redirect('/login')
        }
    } catch {
        return res.redirect("/login");
    }
  };

  const validate = (req, res, next) => {
    const rid = req.query.reportid;
    const wid = req.query.workspaceid;
    const data = filterBasedOnUser(req.cookies.user,req.cookies.role);
    let rf = false, wf = false;
    data.workspaces.forEach((w)=>{
        if(w.id==wid){
            wf=true;
        }
    });
    data.reports.forEach((r)=>{
        if(r.id==rid){
            rf=true;
        }
    });
    if(rf&&wf){
        next();
    } else{
        res.redirect('/');
    }
  };

app.get('/',
authorization,
 function (req, res) {
    // res.sendFile(path.join(__dirname + '/../views/index.html'));
    const data = filterBasedOnUser(req.cookies.user,req.cookies.role);
    res.render("index",{reports:data.reports});
});

app.get('/getreport', authorization, validate, function (req, res) {
    res.render("report", {reportId: req.query.reportid, workspaceId: req.query.workspaceid});
});

function filterBasedOnUser(user,role){
    if(!user || !role){
        return {
            workspaces: [],
            reports: []
        };
    }
    const data = {
        workspaces: [],
        reports: []
    }
    var roles = [];
    if(role=='admin'){
        roles = ['staff','partner','patient'];
    } else{
        roles = [role];
    }
    roles.forEach((r)=>{
        response[r]?.forEach(res=>{
            if(res.access.user.includes(user) || role=='admin'){
    
                data.workspaces.push(
                    {
                        id: res.workspaceid,
                        name: res.workspace_name
                    }
                );
                res.reports.forEach((report)=>{
                    if(report.access.user.includes(user) || role=='admin'){
                        data.reports.push(
                            {
                                id: report.reportId,
                                name: report.report_name,
                                workspace: res.workspaceid
                            }
                        );
                    }
                })
            }
        })
    })
    
    return data;
}

app.get('/getEmbedToken', async function (req, res) {
    // Validate whether all the required configurations are provided in config.json
    var configCheckResult = utils.validateConfig();
    if (configCheckResult) {
        return res.status(400).send({
            "error": configCheckResult
        });
    }
    let result = await embedToken.getEmbedInfo({reportId:req.query.reportid,workspaceId:req.query.workspaceid});
    res.status(result.status).send(result);
});

app.listen(secrets_1.PORT, function () {
    console.log('http://localhost:' + secrets_1.PORT);
});