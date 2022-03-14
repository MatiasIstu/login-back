
const express = require('express');
const app = express();
const cors =require('cors')

app.use(express.urlencoded({extended:false}));
app.use(express.json());


const dotenv = require('dotenv');
dotenv.config({ path: './env/.env'});


app.use('/resources',express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

const bcrypt = require('bcryptjs');

const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));



const connection = require('./database/db');

app.use(cors());

app.post('/register', async (req, res)=>{
	const user = req.body.username;
	const pass = req.body.password;
	let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO users SET ?',{username:user, password:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.send("Todo correcto");
        }
	});
})




app.post('/auth', async (req, res)=> {
	const user = req.body.username;
	const pass = req.body.password;
    let passwordHash = await bcrypt.hash(pass, 8);
	if (user && pass) {
		connection.query('SELECT * FROM users WHERE username = ?', [user], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcrypt.compare(pass, results[0].password)) ) {    
                res.send('Incorrect Username and/or Password!');				
			} else {             
				res.send("Todo OK!");
			}			
			res.end();
		});
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
});

app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});


app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});


app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') 
	})
});
app.listen(4000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:4000');
});