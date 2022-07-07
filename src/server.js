var env = require('dotenv').config();
let path = require('path');
let embedToken = require(__dirname + '/embedConfigService.js');
const utils = require(__dirname + "/utils.js");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var jwt  = require('jsonwebtoken');
const app = express();
var db = require('../database/db');
var response = require('../data/powerBI').module

var user = require("./user")
let config = require(__dirname + "/../config/config.js").module;
var session = require('express-session')
app.set('trust proxy', 1) // trust first proxy
app.use(session({secret: 'mySecret', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.set('view engine', 'ejs');
// Prepare server for Bootstrap, jQuery and PowerBI files
app.use('/js', express.static('./node_modules/bootstrap/dist/js/')); // Redirect bootstrap JS
app.use('/js', express.static('./node_modules/jquery/dist/')); // Redirect JS jQuery
app.use('/js', express.static('./node_modules/powerbi-client/dist/')) // Redirect JS PowerBI
app.use('/css', express.static('./node_modules/bootstrap/dist/css/')); // Redirect CSS bootstrap
app.use('/public', express.static('./public/')); // Use custom JS and CSS files
app.use("/",user);
const port = process.env.PORT || 5300;

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.redirect("/login");
    }
    try {
      const data = jwt.verify(token, process.env.TOKEN_KEY);
    //   req.userId = data.id;
    //   req.userRole = data.role;
      return next();
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
        console.log('first');
        next();
    } else{
        console.log('second');
        res.redirect('/');
    }
  };

app.get('/', authorization, function (req, res) {
    // res.sendFile(path.join(__dirname + '/../views/index.html'));
    const data = filterBasedOnUser(req.cookies.user,req.cookies.role);

    res.render("index", {reports: data.reports});
});

app.get('/getreport', authorization, validate, function (req, res) {
    res.render("report", {reportId: req.query.reportid, workspaceId: req.query.workspaceid});
});

function filterBasedOnUser(user,role){
    console.log(user,role);
    const data = {
        workspaces: [],
        reports: []
    }
    // console.log(response);
    var roles = [];
    if(role=='admin'){
        roles = ['staff','partner','patient'];
    } else{
        roles = [role];
    }
    console.log(roles);
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
    console.log(req.query.reportid);
    // Validate whether all the required configurations are provided in config.json
    configCheckResult = utils.validateConfig();
    if (configCheckResult) {
        return res.status(400).send({
            "error": configCheckResult
        });
    }
    // console.log('embedkeander',filterBasedOnUser());
    // const reportsAndWorkspace = filterBasedOnUser();
    // Get the details like Embed URL, Access token and Expiry
    let result = await embedToken.getEmbedInfo({reportId:req.query.reportid,workspaceId:req.query.workspaceid});

    // result.status specified the statusCode that will be sent along with the result object
    res.status(result.status).send(result);
});

app.listen(port, () => console.log(`Listening on port ${port}`));