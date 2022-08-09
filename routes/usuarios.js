    // Router
const express = require('express');
const router = express.Router();
    // mongoose
const mongoose = require('mongoose');
    // Usuario Model
require('../models/usuarioSchema');
const Usuario = mongoose.model('usuarios');
    // bcrypt - criptografar as senhas
const bcrypt = require('bcryptjs');
    // passport
const passport = require('passport');
    // postagens
require('../models/postagemSchema');
const Postagem = mongoose.model('postagens');

const {Logado} = require('../helpers/autenticado');

router.get('/', (req, res) => {
    Usuario.find().sort({date : 'desc'}).then((usuarios) => {
        res.render('usuarios/index', {usuarios : usuarios});
    }).catch((err) => {
        req.flash('error_msg', 'falha ao buscar os usuários no banco!');
        res.redirect('/');
    });

});

router.get('/login', (req, res) => {
    res.render('usuarios/login');
});

router.post('/login/efetuar', passport.authenticate('local', {
    successRedirect : "/", // caso a autenticação esteja certa, o usuario vai para /
    failureRedirect : "/usuarios/login", // caso esteja errada, o usuario vai para login
    failureFlash : true
}), (req, res, next) => {
    res.redirect('/');
});

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err) 
        }
        req.flash('success_msg', 'Deslogado com sucesso!');
        res.redirect('/');
      })
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
    let erros = [];

    if(!nome ||nome.length < 1) {
        erros.push({texto : 'nome inválido!'});
    }
    if(!nomeUsuario || nomeUsuario.length < 3) { 
        erros.push({texto : 'nome de usuário inválido!'});
    }
    if(email.length < 6) { 
        erros.push({texto : 'email inválido!'});
    }
    if(senha.length < 1) {
        erros.push({texto : 'digite uma senha!'})
    }
    if (confirmaSenha !== senha) {
        erros.push({texto : 'as senhas não batem!'});
    }
    if(erros.length > 0){
        res.render('usuarios/formRegistro', {error : erros})
    }else{

        const arrobaFinal = '@' + nomeUsuario.replace(/@/g, '');

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


                    const newUsuario = new Usuario({
                        nome : nome,
                        arroba : arrobaFinal,
                        biografia : biografia,
                        email : email,
                        senha : senha
                    }); 
                    // agora vamos criptografar a senha com o bcrypt:
                    bcrypt.genSalt(8, (err, salt) => {
                        bcrypt.hash(newUsuario.senha, salt, (err, hash) => {
                            if(err){
                                req.flash('error_msg','houve um erro interno ao processar os dados!');
                                res.redirect('/usuarios/registrar');
                            }
                            newUsuario.senha = hash;

                            newUsuario.save().then(() => {
                                req.flash('success_msg', 'usuário salvo com sucesso!');
                                res.redirect('/usuarios/login');
                            }).catch((err) => {
                                req.flash('error_msg', 'Erro ao salvar os dados!');
                                res.redirect('/usuarios/registrar');
                            });
                        });
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

    }
   
});

router.get('/editar/:arroba', Logado, (req, res) => {
    const arroba = req.params.arroba;
    Usuario.findOne({arroba : arroba}).then((usuario) => {
        if(usuario){
            res.render('usuarios/formEditar', {usuario : usuario});
        }else{
            req.flash('error_msg', 'Usuario não encontrado!');
            res.redirect('/usuarios/');
        }
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao buscar o usuário no banco!');
        res.redirect('/usuarios/');
    });
});

router.post('/editar', Logado, (req, res) => {
    const nome = req.body.nome;
    const nomeUsuario = req.body.arroba;
    const biografia = req.body.biografia;
    const email = req.body.email; // modificar o email não será permitido 
    const senha = req.body.senha;
    const confirmaSenha = req.body.confirmaSenha;
    const id = req.body.id;

    //// FAZER VALIDAÇÃO
    /// COMPARAR A SENHA ANTIGA COM A DIGITADA
    
    const arrobaFinal = '@' + nomeUsuario.replace(/@/g, '');

function atualizaPostagens (usuario) {
    const usuarioId = usuario._id;
    console.log('id: ' + usuarioId);

    let erros = [];

    Postagem.find({usuarioId : usuarioId}).then((postagens) => {
        postagens.forEach(function(postagem){
            postagem.usuario = {
                nome : usuario.nome,
                arroba : usuario.arroba
            };
            postagem.save().then(() => {}).catch((err) => {
                erros = {texto : 'Houve um erro ao atualizar as postagens com os novos dados'};
            });
        });
        if(erros.length > 0) {
            res.render('usuarios/index', {error : erros});
        }else{
            req.flash('success_msg', 'Usuario alterado com sucesso!')
            res.redirect('/usuarios/');
        }
        
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível atualizar os dados nas postagens' + err);
        res.redirect('/usuarios/eu');
    });
}

function salvaNoBanco (id) {
    Usuario.findOne({_id : id}).then((usuario) => {
        usuario.nome = nome;
        usuario.arroba = arrobaFinal;
        usuario.biografia = biografia;
        usuario.senha = senha;

        usuario.save().then(() => {
            atualizaPostagens(usuario);
        }).catch((err) => {
            req.flash('error_msg', 'ERRO INTERNO: não foi possível salvar as alterações');
            res.redirect('/usuarios/');
        });
        
    }).catch((err) => {
        console.log('deu merda: '+ err);
    });
}

/// impedindo, por meio do id, que o usuário não consiga repetir o "arroba" de outro usuário    
    Usuario.findOne({arroba : arrobaFinal}).then((usuario) => {
        const idUsuario = usuario._id;
        if (idUsuario == id){
            salvaNoBanco(id);
        }else{
            Usuario.findOne({_id : id}).then((usu) => {
                req.flash('error_msg', 'nome de usuário já utilizado!');
                res.redirect('/usuarios/editar/' + usu.arroba);
            }).catch((err) => {
                req.flash('error_msg', 'erro interno ao realizar operação!');
                res.redirect('/usuarios/');
            });
        }
    }).catch((err) => {
        salvaNoBanco(id);
    });

    
});

router.get('/apagar/:id', Logado, (req, res) => {
    const id = req.params.id;
    Usuario.deleteOne({_id : id}).then(() => {
        Postagem.deleteMany({usuarioId : id}).then(() =>{
            req.flash('success_msg', 'Usuario apagado com sucesso!');
            res.redirect('/usuarios/');
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao apagar os dados do usuário!');
            res.redirect('/usuarios/');
        });
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao apagar usuário!');
        res.redirect('/usuarios/');
    });
    
});

router.get('/eu', Logado, (req, res) => {
    if(req.user){
        Postagem.find({usuarioId : req.user._id}).sort({date : 'desc'}).then((postagens) => {
            res.render('usuarios/meuPerfil', {postagens : postagens});
        }).catch((err) => {
            console.log('deu erro aqui : ' + err);
        });
    }
    else{
        req.flash('error_msg', 'Você deve estar logado para acessar essa página!');
        res.redirect('/usuarios/login');
    }
});

router.get('/perfil/:arroba', (req, res) => {
    const arroba = req.params.arroba;
    Usuario.findOne({arroba : arroba}).then((usuario) => {
        res.render('usuarios/perfil', {usuario : usuario});
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao procurar usuário!');
        res.redirect('/usuarios/');
    });
});

router.get('/seguir/:arroba', Logado, (req, res)=> {
    const usuarioEscolhido = req.params.arroba;
    const usuarioLogado = req.user;

    if(usuarioLogado.arroba === usuarioEscolhido) {
        req.flash('error_msg', 'Você não pode seguir a si mesmo!');
        res.redirect('/usuarios/perfil/' + usuarioEscolhido);
    }else{
        Usuario.findOne({_id : usuarioLogado._id}).then((usuLogado) => {
            Usuario.findOne({arroba : usuarioEscolhido}).then((usuEscolhido) => {
                    const idEscolhido = usuEscolhido._id;
                    const index = usuLogado.seguindo.indexOf(idEscolhido, 0);
                    if (index === -1) {
                        usuLogado.seguindo.push(idEscolhido);
                    }else {
                        usuLogado.seguindo.splice(index, 1);
                    }
                    usuLogado.save().then(() => {
                        if(index === -1){
                            usuEscolhido.seguidores.push(usuLogado._id);
                            usuEscolhido.save().then(() => {
                                req.flash('success_msg', 'Você seguiu ' + usuEscolhido.nome);
                                res.redirect('/usuarios/perfil/' + usuarioEscolhido); 
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível realizar essa operação!');
                                res.redirect('/usuarios/perfil/' + usuarioEscolhido);
                            }); 
                        }else{
                            const idLogado = usuLogado._id;
                            const unfIndex = usuEscolhido.seguidores.indexOf(idLogado);

                            if(unfIndex === -1) {
                                req.flash('error_msg', 'Ocorreu uma falha ao atualizar os dados da operação realizada!');
                                res.redirect('/usuarios/perfil/' + usuarioEscolhido);  
                            }else{
                                usuEscolhido.seguidores.splice(unfIndex, 1);

                                usuEscolhido.save().then(() => {
                                    req.flash('success_msg', 'Você deixou de seguir ' + usuEscolhido.nome);
                                    res.redirect('/usuarios/perfil/' + usuarioEscolhido); 
                                }).catch((err) => {
                                    req.flash('error_msg', 'Não foi possível realizar essa operação!');
                                    res.redirect('/usuarios/perfil/' + usuarioEscolhido);
                                }); 
                            }
                        }
                    }).catch(() => {
                        req.flash('error_msg', 'Não foi possível realizar essa operação!');
                        res.redirect('/usuarios/perfil/' + usuarioEscolhido);
                    }); 
            }).catch((err) => {
                req.flash('error_msg', 'Falha interna ao encontrar usuário! ' + err);
                res.redirect('/usuarios/perfil/' + usuarioEscolhido);
            });
        }).catch((err) => {
            req.flash('error_msg', 'Falha interna ao identificar usuario logado!');
            res.redirect('/usuarios/perfil/' + usuarioEscolhido);
        });
    }

});

module.exports = router;