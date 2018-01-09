function UsuarioDAO(connection){
	this._connection = connection();
}

UsuarioDAO.prototype.insert = function(usuario){
	this._connection.open(function(err, mongoClient){

		if(err){
			console.log("DEUUUUUUUUUUU PAU FUDIDO")
		}
		mongoClient.collection('usuarios', function(err, res){
			res.insert(usuario);
			mongoClient.close();
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
			res.find(usuario).toArray(function(err, res){

				if(res[0] != undefined){
					req.session.autorizado = true;
					req.session.usuario = res[0].usuario;
					req.session.casa = res[0].casa;
				}

				if(req.session.autorizado){
					response.redirect('jogo');
				}else{
					response.send('usuario nao existe');
				}

			});
			mongoClient.close();
		});
	});
};

module.exports = function(){
	return UsuarioDAO;
}