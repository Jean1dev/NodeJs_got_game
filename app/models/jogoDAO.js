var ObjectID = require('mongodb').ObjectId;

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

jogoDAO.prototype.iniciaJogo = function(res, usuario, casa, comando){
	this._connection.open(function(err, mongoClient){
		mongoClient.collection('jogo', function(err, result){
			result.find({usuario : usuario}).toArray(function(err, result){
				res.render('jogo', {img_casa: casa, jogo: result[0], msg: comando});
			});
			mongoClient.close();
		});
	});
}

jogoDAO.prototype.acao = function(acao){
	this._connection.open(function(err, mongoClient){
		mongoClient.collection('acao', function(err, result){
			var date = new Date();
			var tempo = null;

			switch(parseInt(acao.acao)){
				case 1: tempo = 1 * 60 * 60000; break;
				case 2: tempo = 2 * 60 * 60000; break;
				case 3: tempo = 5 * 60 * 60000; break;
				case 4: tempo = 5 * 60 * 60000; break;
			}

			acao.acao_termina_em = date.getTime() + tempo;

			result.insert(acao);
		});

		mongoClient.collection('jogo', function(err, result){
			var moedas = null;
			switch(parseInt(acao.acao)){
				case 1: moedas = -2 * acao.quantidade; break;
				case 2: moedas = -3 * acao.quantidade; break;
				case 3: moedas = -1 * acao.quantidade; break;
				case 4: moedas = -3 * acao.quantidade; break;
			}
			result.update(
				{usuario: acao.usuario},
				{$inc: {moeda: moedas}}
			);
		});
		mongoClient.close();
	});
}

jogoDAO.prototype.getAcoes = function(usuario, res){
	this._connection.open(function(err, mongoClient){
		mongoClient.collection('acao', function(err, result){
			var date = new Date();
			var momento_atual = date.getTime();

			result.find({usuario : usuario, acao_termina_em: {$gt: momento_atual}}).toArray(function(err, result){
				res.render('pergaminhos', {acoes: result});
			});
		});
		mongoClient.close();
	});
}

jogoDAO.prototype.revogar_acao = function(id, res){
	this._connection.open(function(err, mongoClient){
		mongoClient.collection('acao', function(err, result){
			result.remove(
				{_id: ObjectID(id)},
				function(err, result){
					res.redirect('jogo?msg=D');
					mongoClient.close();
				}
			);
		});
	});
}

module.exports = function(){
	return jogoDAO;
}