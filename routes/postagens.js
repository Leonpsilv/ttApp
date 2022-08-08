    // Router
const express = require('express');
const router = express.Router();
    // Mongoose
const mongoose = require('mongoose');
    // Postagem Model
require('../models/postagemSchema');
const Postagem = mongoose.model('postagens');
    // Usuario Model
require('../models/usuarioSchema');
const Usuario = mongoose.model('usuarios');

const {Logado} = require('../helpers/autenticado');

router.get('/', (req, res) => {
    const usuarioLogado = req.user;
    if(usuarioLogado){
        res.render('postagens/index', {usuario : usuarioLogado});
    }else{
        req.flash('error_msg', 'Você deve estar logado para postar algo!');
        res.redirect('/usuarios/login');
    }
});

router.post('/adicionar', Logado, (req, res) => {
    //const id = req.body.id
    const conteudo = req.body.conteudo;
    const usuarioLogado = req.user;
    if(conteudo.length < 0){
        req.flash('error_msg', 'a publicação não pode estar vazia!');
        res.redirect('/postagens/');
    }
    if(usuarioLogado){
        const newPostagem = new Postagem({
            conteudo : conteudo,
            usuarioId : req.user._id,
            usuario : {
                nome : req.user.nome,
                arroba : req.user.arroba
            }
        });
        newPostagem.save().then(() => {
            req.flash('success_msg', 'Publicado com sucesso!');
            res.redirect('/usuarios/eu');
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno ao salvar postagem!');
            res.redirect('/postagens/');
        });
    }else{
        req.flash('error_msg', 'Você deve estar logado para postar algo!');
        res.redirect('/usuarios/login');
    }
});

router.get('/apagar/:id', Logado, (req, res) => {
    const id = req.params.id;
    Postagem.deleteOne({_id : id}).then(() => {
        req.flash('success_msg', 'Tuite apagado com sucesso!');
        res.redirect('/usuarios/eu');
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao apagar tuite!');
        res.redirect('/usuarios/eu');
    });
});



module.exports = router;