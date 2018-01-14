module.exports.cadastro = function(application, req, res){
	res.render('cadastro', {validacao: {}, dados: {}});
};

module.exports.cadastrar = function(application, req, res){
	var dadosForm = req.body;

	req.assert('nome', 'o campo nome não pode ser vazio').notEmpty();
	req.assert('usuario', 'o campo usuario não pode ser vazio').notEmpty();
	req.assert('senha', 'o campo senha não pode ser vazio').notEmpty();
	req.assert('casa', ' campo casa não pode ser vazio').notEmpty();

	var err = req.validationErrors();

	if(err){
		console.log(err);
		res.render('cadastro', {validacao: err, dados: dadosForm});
		return;
	}

	var connection = application.config.dbconnection;
	var UsuarioDAO = new application.app.models.UsuarioDAO(connection);
	var jogoDAO = new application.app.models.jogoDAO(connection);

	UsuarioDAO.insert(dadosForm, res);
	jogoDAO.gerarParametros(dadosForm.usuario);

	console.log('EXECUTOU TODA A FUNÇÃO');
};