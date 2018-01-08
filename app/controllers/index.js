module.exports.index = function(application, req, res){
	res.render('index', {validacao: {}});
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

	res.send('succes');
};