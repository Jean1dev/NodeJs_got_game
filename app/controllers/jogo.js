module.exports.jogo = function(app, req, res){
	
	if(req.session.autorizado != true){
		res.render('index', {validacao: {}});
	}

	var msg = '';

	if(req.query.msg != ''){
		msg = req.query.msg;
	}

	var casa = req.session.casa;
	var usuario = req.session.usuario;
	var connection = app.config.dbconnection;
	var jogoDAO = new app.app.models.jogoDAO(connection);

	jogoDAO.iniciaJogo(res ,usuario, casa, msg);

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

	var connection = app.config.dbconnection;
	var jogoDAO = new app.app.models.jogoDAO(connection);
	var usuario = req.session.usuario;

	jogoDAO.getAcoes(usuario, res);

}

module.exports.ordernar_acao_sudito = function(app, req, res){
	var dados = req.body;

	req.assert('acao', 'campo acao precisa ser informado').notEmpty();
	req.assert('quantidade', 'quantidade precisa ser informado').notEmpty();

	var err = req.validationErrors();

	if(err){
		res.redirect('jogo?msg=E');
		return;
	}

	var connection = app.config.dbconnection;
	var jogoDAO = new app.app.models.jogoDAO(connection);

	dados.usuario = req.session.usuario;
	jogoDAO.acao(dados);

	res.redirect('jogo?msg=A');
}

module.exports.revogar_acao = function(app, req, res){
	var url = req.query;
	var connection = app.config.dbconnection;
	var jogoDAO = new app.app.models.jogoDAO(connection);
	var id = url.id_acao;

	jogoDAO.revogar_acao(id, res);
}