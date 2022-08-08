module.exports = {
    Logado : function (req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }

        req.flash('error_msg', 'é necessário estar logado para realizar essa operação!');
        res.redirect('/usuarios/login');
    }
}