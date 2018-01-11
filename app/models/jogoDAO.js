function jogoDAO(connection){
	this._connection = connection();
}

jogoDAO.prototype.gerarParametros = function(usuario){
	this._connection.open( function(err, mongoClient){
		mongoClient.collection('jogo', function(err, result){
			result.insert({
				usuario: 	usuario,
				moeda: 		15,
				suditos: 	10,
				temor: 		Math.floor(Math.random() * 1000),
				sabedoria:  Math.floor(Math.random() * 1000), 
				comercio: 	Math.floor(Math.random() * 1000),
				magia: 		Math.floor(Math.random() * 1000)
			})
		});
		mongoClient.close();
	});
}

jogoDAO.prototype.iniciaJogo = function(res, usuario, casa){
	this._connection.open(function(err, mongoClient){
		mongoClient.collection('jogo', function(err, result){
			result.find({usuario : usuario}).toArray(function(err, result){
				res.render('jogo', {img_casa: casa, jogo: result[0]});
			});
			mongoClient.close();
		});
	});
}

module.exports = function(){
	return jogoDAO;
}