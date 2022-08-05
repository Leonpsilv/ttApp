const PORT = 8081;
    // express
const express = require('express');
const app = express();
    // express-handlebars
const handlebars = require('express-handlebars');
    // path - bootstrap
const path = require('path');
    // mongoose
const mongoose = require('mongoose');
    // flash e session
const flash = require('connect-flash');
const session = require('express-session');
    //auth
const passport = require('passport');
require('./config/auth')(passport);
    // postagens
require('./models/postagemSchema');
const Postagem = mongoose.model('postagens');



/// configs
    // session
    app.use(session({
        secret : "BoraTentarFazerIsso",
        resave : true,
        saveUninitialized : true
    })); // configurando auth antes da sessão
        // auth
        app.use(passport.initialize());
        app.use(passport.session());

    app.use(flash());

    // handlebars
    app.engine('handlebars', handlebars.engine({
        defaultLayout: 'main', 
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
            } 
    }));
    app.set('view engine', 'handlebars');

    // "body parser" - receber dados de requisiçoes http
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());

    // bootstrap - public
    app.use(express.static(path.join(__dirname + "/public")));

    // mongoose
    mongoose.connect('mongodb://localhost/ttapp')
    .then(() => {
        console.log('mongodb conectado!');
    }).catch((err) => {
        console.log('erro ao conectar com o banco!')
    });

    // variáveis globais e flash
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.users = req.user;
        
        next();
    });

/// Rotas
app.get('/', (req, res) => {
    Postagem.find().sort({date : 'desc'}).then((postagens) => {
        res.render('public/index', {postagens : postagens});
    }).catch((err) => {
        res.send('INTERNAL ERROR :(');
    });

});

    // usuarios
    const usuario = require('./routes/usuarios');
    app.use('/usuarios', usuario);

    // postagens
    const postagem = require('./routes/postagens');
    app.use('/postagens', postagem);

/// Outros
app.listen(PORT, () => {
    console.log('servidor está rodando, na porta: ' + PORT);
});


