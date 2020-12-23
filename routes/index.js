var fs = require('fs');
var axios = require('axios');
const helpers = require('../helpers/function');
module.exports = function(app){
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file == "index.js") return;
        // var name = file.substr(0, file.indexOf('.'));
        var name=file
        require('./' + name)(app);
    });
    app.get('/', function (req, res) {
        res.send('freelancer job notification')
    });
    app.get('/test', function (req, res) {
        console.log('test: ', );
        res.send('test');
    });
    app.get('/keepalive', function (req, res) {
        res.send('keep-alive');
    })
    app.get("/project_details", function (req, res) {
        // var project_id = req.query.project_id;
        var project_id = req.query.project_id;
        console.log(req.body);
        var details = helpers.project_details(project_id);
        res.send(details);
    });
    app.post("/project_details", function (req, res) {
        var project_id = req.body.event.text;
        if(req.body.event.channel =='C01GYRXQ0E5' && req.body.event.subtype == undefined) {
            if(/^[0-9]{8}$/.test(req.body.event.text)){
                var details = helpers.project_details(project_id);
            }
        }
        res.send(project_id);
    });
    app.get("/user_details", function (req, res) {
        
    });
}