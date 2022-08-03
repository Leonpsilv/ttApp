    // Router
const express = require('express');
const router = express.Router();
    // mongoose
const mongoose = require('mongoose');
    // Usuario Model
require('../models/usuarioSchema');
const Usuario = mongoose.model('usuarios');

router.get('/', (req, res) => {
    Usuario.find().sort({date : 'desc'}).then((usuarios) => {
        res.render('usuarios/index', {usuarios : usuarios});
    }).catch((err) => {
        req.flash('error_msg', 'falha ao buscar os usuários no banco!');
        res.redirect('/');
    });

});

router.get('/registrar', (req, res) => {
    res.render('usuarios/formRegistro');
});

router.post('/registrar/novo', (req, res) => {
    const nome = req.body.nome;
    const nomeUsuario = req.body.arroba;
    const biografia = req.body.biografia;
    const email = req.body.email;
    const senha = req.body.senha;
    const confirmaSenha = req.body.confirmaSenha;
    let arrobaFinal = '@';

    if(!nome ||nome.length < 1) {
        req.flash('error_msg', 'Nome inválido: muito curto'); 
        res.redirect('/usuarios/registrar');
    }
    if(!nomeUsuario || nomeUsuario.length < 3) { 
        req.flash('error_msg', 'Nome de usuário inválido: muito curto'); 
        res.redirect('/usuarios/registrar');
    }
    if(email.length < 6) { 
        req.flash('error_msg', 'Email inválido: muito curto'); 
        res.redirect('/usuarios/registrar');
    }
    //////////////////////////////////////////////////////////// arrumar validação ///////////////////////
    arrobaFinal += nomeUsuario;

    // verificando se o usuário já está cadastrado
    Usuario.find({arroba : arrobaFinal}).then((usuario) => {
        if(usuario.length > 0){
            req.flash('error_msg','nome de usuário ou email já utilizados em outra conta!');
            res.redirect('/usuarios/registrar');
        }else {
            Usuario.find({email: email}).then((usuario) => {
                if(usuario.length > 0){
                    req.flash('error_msg','nome de usuário ou email já utilizados em outra conta!');
                    res.redirect('/usuarios/registrar');
                }else{
                    const newUsuario = {
                        nome : nome,
                        arroba : arrobaFinal,
                        biografia : biografia,
                        email : email,
                        senha : senha
                    }
                    new Usuario(newUsuario).save().then(() => {
                        req.flash('success_msg', 'usuário salvo com sucesso!');
                        res.redirect('/usuarios/');
                    }).catch((err) => {
                        req.flash('error_msg', 'Erro ao salvar os dados!');
                        res.redirect('/usuarios/registrar');
                    });
                }
                
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao verificar se o usuario já existe!');
                res.redirect('/usuarios/');
            });
        }
    }).catch(() => {
        req.flash('error_msg', 'Erro ao verificar se o usuario já existe!');
        res.redirect('/usuarios/');
    });




});

router.get('/editar', (req, res) => {

});

module.exports = router;