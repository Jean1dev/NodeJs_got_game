module.exports.jogo = function(app, req, res){
	
	if(req.session.autorizado != true){
		res.render('index', {validacao: {}});
	}

	var casa = req.session.casa;
	var usuario = req.session.usuario;
	var connection = app.config.dbconnection;
	var jogoDAO = new app.app.models.jogoDAO(connection);

	jogoDAO.iniciaJogo(res ,usuario, casa);

};

module.exports.sair = function(app, req, res){

	req.session.destroy(function(err, result){
		res.render('index', {validacao: {}})
	});
};