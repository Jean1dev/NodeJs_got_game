module.exports.jogo = function(app, req, res){
	
	if(req.session.autorizado != true){
		res.render('index', {validacao: {}});
	}

	var comando_invalido = 'N';

	if(req.query.comando_invalido == 'S'){
		comando_invalido = 'S';
	}

	var casa = req.session.casa;
	var usuario = req.session.usuario;
	var connection = app.config.dbconnection;
	var jogoDAO = new app.app.models.jogoDAO(connection);

	jogoDAO.iniciaJogo(res ,usuario, casa, comando_invalido);

};

module.exports.sair = function(app, req, res){

	req.session.destroy(function(err, result){
		res.render('index', {validacao: {}})
	});
};

module.exports.suditos = function(app, req, res){
	if(req.session.autorizado != true){
		res.render('index', {validacao: {}});
	}
	res.render('aldeoes', {validacao: {}});
}

module.exports.pergaminhos = function(app, req, res){
	if(req.session.autorizado != true){
		res.render('index', {validacao: {}});
	}
	res.render('pergaminhos', {validacao: {}});
}

module.exports.ordernar_acao_sudito = function(app, req, res){
	var dados = req.body;

	req.assert('acao', 'campo acao precisa ser informado').notEmpty();
	req.assert('quantidade', 'quantidade precisa ser informado').notEmpty();

	var err = req.validationErrors();

	if(err){
		res.redirect('jogo?comando_invalido=S');
		return;
	}


}