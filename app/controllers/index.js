module.exports.index = function(application, req, res){
	res.render('index', {validacao: {}});
};

module.exports.success = function(application, req, res){
	res.render('success');
};

module.exports.autenticar = function(application, req, res){
	var dadosForm = req.body;

	req.assert('usuario', 'usuario nao pode ser vazio').notEmpty();
	req.assert('senha', 'senha nao pode ser vazio').notEmpty();

	var err = req.validationErrors();

	if(err){
		res.render('index', {validacao: err});
		return;
	}

	var connection = application.config.dbconnection;
	var UsuarioDAO = new application.app.models.UsuarioDAO(connection);

	UsuarioDAO.autenticar(dadosForm, req, res);
	
};