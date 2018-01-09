module.exports.jogo = function(app, req, res){
	
	if(req.session.autorizado){
		res.render('jogo');
	}else{
		res.render('index', {validacao: {}});
	}
};

module.exports.sair = function(app, req, res){

	req.session.destroy(function(err, result){
		res.render('index', {validacao: {}})
	});
};