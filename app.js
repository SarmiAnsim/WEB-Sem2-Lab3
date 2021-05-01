// Require packages and set the port
const express = require('express');
var session = require('express-session');
var CryptoJS = require("crypto-js");

const port = 3002;
const bodyParser = require('body-parser');
var cors = require('cors');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const app = express();
const fs = require('fs');
var dataPath = "jsons/datas/data.json";
var Data;
var activePath = "jsons/activity.json";
var Active;
var usersPath = "jsons/users/unCodeUsers.json";
var Users;

fs.readFile(dataPath, 'utf8', function (err, data) {
    if (err) throw err;
    Data = JSON.parse(data);
});

fs.readFile(activePath, 'utf8', function (err, data) {
    if (err) throw err;
    Active = JSON.parse(data);
});

fs.readFile(usersPath, 'utf8', function (err, data) {
    if (err) throw err;
    Users = JSON.parse(data);
});

app.use(express.static('src'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(cors())

app.use(
  session({
    secret: 'you secret key',
    saveUninitialized: true,
  })
)

app.use(function (req, res, next) {

	if(req.session.authorized == null)
	{
		req.session.userId = "";
		req.session.authorized = false;
	} else if(req.session.authorized) {
    	var user = Users.find(item => item.id == req.session.userId);
    	user.activity = (new Date()).toJSON();
	}
	next();
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function encrypt(Message)
{
	return CryptoJS.AES.encrypt(Message, "Secret Passphrase").toString();
}
function decrypt(Message)
{
	return CryptoJS.AES.decrypt(Message, "Secret Passphrase").toString(CryptoJS.enc.Utf8);
}
app.get('/', function(req, res) {

	if(!req.session.authorized)
  		res.sendfile('src/AuthorizationAndRegistration.html');
  	else
  		res.sendfile('src/all.html');
});

app.get('/user', (request, response, next) => {
	//var result = Data.find(item => `:user=${item.user}` == request.params.user);
	var result = Data.find(item => item.user == request.session.userId);
    response.send(JSON.stringify(result));
});

app.get('/history', (request, response, next) => {
	var dt = Users.slice(0).sort(function(a, b) {
		var dateA = new Date(a.activity),
			dateB = new Date(b.activity)
  		if (dateA.getTime() > dateB.getTime()) {
    		return -1; }
  		if (dateA.getTime() < dateB.getTime()) {
    		return 1; }
    	
  		return 0;
	});

	var result = [];
	dt.forEach(function (item) {
  		var rez = {
  			name: item.name,
  			activity: item.activity
  		}
  		result.push(rez);
	});
    response.send(JSON.stringify(result));
});

app.post('/newId', (request, response, next) => {
    if(!request.body) return response.sendStatus(400);

    var user = Users.find(item => item.id == request.session.userId);
    console.log(user);
    var dt = Data.find(item => item.user == user.id);
    user.id = uuidv4();
    dt.user = user.id;

    request.session.userId = "";
    request.session.authorized = false;

    fs.writeFile(usersPath, JSON.stringify(Users, null, 2), function(error){
        if(error) throw error; // если возникла ошибка
                 
        //console.log("Запись пользователей завершена.");
    });
    fs.writeFile(dataPath, JSON.stringify(Data, null, 2), function(error){
        if(error) throw error; // если возникла ошибка
                 
        //console.log("Запись базы данных завершена.");
    });
    response.sendStatus(200);
});

app.post('/mydata', (request, response, next) => {
    if(!request.body) return response.sendStatus(400);

	console.log(request.body);
	var result = Users.find(item => item.id == request.session.userId);
    response.send(JSON.stringify(result));
});

app.post('/changeUser', (request, response, next) => {
    if(!request.body) return response.sendStatus(400);

	console.log(request.body);
	var user = Users.find(item => item.id == request.session.userId);

	var result = {
        code: 1,
        user: user.id
    }
	user.name = request.body.name;
	if(request.body.psw != "" && request.body.email != "")
		if(request.body.oldpsw == decrypt(user.psw)) {
			user.psw = encrypt(request.body.psw);
			user.login = request.body.email;
		} else
			result.code = 0;

	fs.writeFile(usersPath, JSON.stringify(Users, null, 2), function(error){
        if(error) throw error; // если возникла ошибка
                 
        //console.log("Запись пользователей завершена.");
    });
    response.send(result);
});

app.post('/find', (request, response, next) => {
    if(!request.body) return response.sendStatus(400);

    console.log(request.body);

    var result = Data.find(item => item.user == request.session.userId).data
    				.filter(item => item.age == request.body.age);

    console.log(result);

    response.send(JSON.stringify(result));
});

app.post("/login", urlencodedParser, (request, response, next) => {
    if(!request.body) return response.sendStatus(400);

    var user = Users.find(item => item.login == request.body.login);
    var dt = Data.find(item => item.user == user.id);
    user.id = uuidv4();
    dt.user = user.id;
    
    user.activity = (new Date()).toJSON();
    var result = {
        code: 1,
        user: user.id
    }
    if(user == null) result.code = 0;
    else if(decrypt(user.psw) != request.body.psw.toString()) result.code = 0;
    else {
    	result.code = 1;
    	request.session.userId = result.user;
    	request.session.authorized = true;
    }
    fs.writeFile(usersPath, JSON.stringify(Users, null, 2), function(error){
        if(error) throw error; // если возникла ошибка
                 
        //console.log("Запись пользователей завершена.");
    });
    fs.writeFile(dataPath, JSON.stringify(Data, null, 2), function(error){
        if(error) throw error; // если возникла ошибка
                 
        //console.log("Запись базы данных завершена.");
    });

    response.send(result);

});

app.post("/register", urlencodedParser, (request, response) => {
    if(!request.body) return response.sendStatus(400);

    var result = {
        	code: 1,
        	user: "null"
    	}

    var user = Users.find(item => item.login == request.body.email);

    if(user != null){
    	result.code = 0;
    }
    else{

    	var newItem = {
        	id: uuidv4(),
        	name: request.body.name,
        	login: request.body.email,
        	psw: encrypt(request.body.psw),
        	activity: new Date()
    	}
    	var newData = {
    		user: newItem.id,
    		data: []
    	}

    	console.log(newItem);
    	Users.push(newItem);
    	Data.push(newData);

    	request.session.userId = newItem.id;
    	request.session.authorized = true;

    	fs.writeFile(usersPath, JSON.stringify(Users, null, 2), function(error){
        	if(error) throw error; // если возникла ошибка
                 
        	//console.log("Запись пользователей завершена.");
    	});
    	fs.writeFile(dataPath, JSON.stringify(Data, null, 2), function(error){
        	if(error) throw error; // если возникла ошибка
                 
        	//console.log("Запись базы данных завершена.");
    	});

    	result.code = 1;
    	result.user = newItem.id;
    	request.session.userId = result.user;
    }

    response.send(result);
    
});

app.post("/add", urlencodedParser, (request, response, next) => {
    if(!request.body) return response.sendStatus(400);

    var dt = Data.find(item => item.user == request.session.userId).data;
    var newid = 0;
    if(dt.length != 0)
    	newid = dt[dt.length - 1].id;

    var newItem = {
        id: newid + 1,
        name: request.body.name,
        age: request.body.age,
        email: request.body.email
    }
    console.log(newItem);

    dt.push(newItem);
    fs.writeFile(dataPath, JSON.stringify(Data, null, 2), function(error){
        if(error) throw error; // если возникла ошибка
                 
        //console.log("Запись файла завершена.");
    });

    response.send(`Successfully added!`);
});

app.put("/change", urlencodedParser, (request, response, next) => {
    if(!request.body) return response.sendStatus(400);
    console.log(request.body);

    var dt = Data.find(item => item.user == request.session.userId).data;
    var find = dt.find(item => item.id == request.body.id);

    find.name = request.body.name;
    find.age = request.body.age;
    find.email = request.body.email;

    fs.writeFile(dataPath, JSON.stringify(Data, null, 2), function(error){
        if(error) throw error; // если возникла ошибка
                 
        //console.log("Запись файла завершена.");
    });

    response.send(`Successfully added!`);
});

app.delete("/delete", urlencodedParser, (request, response, next) => {
    if(!request.body) return response.sendStatus(400);
    console.log(request.body);

    let users = [];
    var dt = Data.find(item => item.user == request.session.userId);
    for(var i = 0; i < request.body.id.length; ++i){
        users.push(dt.data.find(item => item.id == request.body.id[i]));
    }

    console.log("Delete:" + JSON.stringify(users, null, 2));
    if(users)
    {
        for(var i = 0; i < users.length; ++i)
            if(users[i])
                dt.data.splice(dt.data.indexOf(users[i]), 1);

        fs.writeFile(dataPath, JSON.stringify(Data, null, 2), function(error){
            if(error) throw error; // если возникла ошибка
                 
            //console.log("Запись файла завершена.");
        });

        response.send(`Successfully deleted!`);
    } else response.send(`Not Found!`);
});

// Start the server
const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
    console.log(`Server listening on port ${server.address().port}`);
});
