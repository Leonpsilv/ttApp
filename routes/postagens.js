    // Router
const express = require('express');
const router = express.Router();
    // Mongoose
const mongoose = require('mongoose');
    // Postagem Model
require('../models/postagemSchema');
const Postagem = mongoose.model('postagens');

router.get('/', (req, res) => {
    const usuarioLogado = req.user;
    if(usuarioLogado){
        res.render('postagens/index', {usuario : usuarioLogado});
    }else{
        req.flash('error_msg', 'Você deve estar logado para postar algo!');
        res.redirect('/usuarios/login');
    }
});

router.post('/adicionar', (req, res) => {
    //const id = req.body.id
    const conteudo = req.body.conteudo;
    const usuarioLogado = req.user;
    if(conteudo.length < 0){
        req.flash('error_msg', 'digite alguma coisa para ser publicada!');
        res.redirect('/postagens/');
    }
    if(usuarioLogado){
        const newPostagem = new Postagem({
            conteudo : conteudo,
            usuario : req.user
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



module.exports = router;