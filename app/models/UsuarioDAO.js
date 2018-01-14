var crypto = require('crypto');

function UsuarioDAO(connection){
	this._connection = connection();
}

UsuarioDAO.prototype.insert = function(usuario, response){
	this._connection.open(function(err, mongoClient){

		if(err){
			console.log("DEUUUUUUUUUUU PAU FUDIDO")
		}
		mongoClient.collection('usuarios', function(err, res){
			var senha_crypto = crypto.createHash('md5').update(usuario.senha).digest('hex');
			usuario.senha = senha_crypto;

			res.insert(usuario);
			mongoClient.close();
			response.redirect('success');
		});
	});
}

UsuarioDAO.prototype.autenticar = function(usuario, req, response){
	this._connection.open(function(err, mongoClient){

		if(err){
			response.send('cant connect');
			return;
		}

		mongoClient.collection('usuarios', function(err, res){
			var senha_crypto = crypto.createHash('md5').update(usuario.senha).digest('hex');
			usuario.senha = senha_crypto;

			res.find(usuario).toArray(function(err, res){

				if(res[0] != undefined){
					req.session.autorizado = true;
					req.session.usuario = res[0].usuario;
					req.session.casa = res[0].casa;
				}

				if(req.session.autorizado){
					response.redirect('jogo');
				}else{
					usuario.msg = 'Usuario ou senha Incorretos';
					response.render('index', {validacao: usuario});
				}

			});
			mongoClient.close();
		});
	});
};

module.exports = function(){
	return UsuarioDAO;
}