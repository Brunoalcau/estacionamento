'use strict'
import express     from 'express'
import path      	 from 'path'
import morgan   	 from 'morgan'
import bodyParser  from 'body-parser'
import cors				 from 'cors'
import jwt  			 from 'jsonwebtoken'
import consign 		 from 'consign'
import http 		 	 from 'http'




const app = express()
app.set('superSecret', '1a5H(qzO&1+!8M35tXvai3A*JF%Os]eOoG63/Oo+:1S(R[%x[js09UKDam0#85'); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use(express.static(path.join(__dirname, '/public')));


/*
	Validação do token
*/
var apiRoutes = express.Router(); 

apiRoutes.use((req, res, next)=> {
  var token = req.headers['x-access-token'];
  if (token) {
  	jwt.verify(token, app.get('superSecret'), (err, decoded)=> {      
  		if (err) {
  			return res.json({ success: false, message: 'Failed to authenticate token.' });    
  		} else {
  			req.decoded = decoded;    
  			next();
  		}
  	});

  } else {

  	return res.status(403).send({ 
  		success: false, 
  		message: 'Você não tem permissão.' 
  	});

  }
});



app.use('/api', apiRoutes);


	/*
	Importando os modulos..
	*/
	consign({cwd:'app', verbose:false})
	.include('models')
	.include('funcoes')
	.then('controllers')
	.then('routes')
	.then('config')
	.into(app)

	app.set('port', (process.env.PORT || 3000))

	const port = app.get('port')

	var server = http.createServer(app);

//socket io
require('./app/socket/socket.js')(server)

server.listen(port, () => console.log('Servidor rodando na porta: %d', port))



