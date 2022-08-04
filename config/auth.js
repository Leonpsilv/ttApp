    // passport-local
const passport = require("passport");
const localStrategy = require('passport-local').Strategy;
    // mongoose
const mongoose = require('mongoose');
    //bcryptjs
const bcrypt = require('bcryptjs');
    //Model usuario
require('../models/usuarioSchema');
const Usuario = mongoose.model('usuarios');

module.exports = function (passport) {
    
    passport.use( new localStrategy({usernameField : 'arroba', passwordField : 'senha'}, (arroba, senha, done) => { // configurando o campo que será analisado e passando uma função de callback
        Usuario.findOne({arroba : arroba}).then((usuario) => {
            if(!usuario){
                return done(null, false, {texto: 'esta conta não existe!'}); // dados da conta autenticada (null), autenticação bem sucedida(false), mensagem 
            }
            bcrypt.compare(senha, usuario.senha, (error, certas) => {
                if(certas){ // se a senha estiver correta:
                    return done(null, usuario);
                }else{
                    return done(null, false, {texto: 'senha incorreta'});
                }
            }); // comparando os valores encriptados

        }).catch((err) => {
            console.log('DEU ERRO AUTH: ' + err);
        });
    })); 

    passport.serializeUser((usuario, done) => { // passando os dados do usuario para uma sessão
        done(null, usuario.id);
    });

    passport.deserializeUser((id, done) => { 
        Usuario.findById(id, (err, usuario) => { // procurando um usuario pelo id
            done(err, usuario);
        }); 
    });

    // ambas essas duas ultimas funções servem para salvar os dados do usuário na sessão

}