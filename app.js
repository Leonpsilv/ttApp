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


/// configs
    // handlebars
    app.engine('handlebars', handlebars.engine({
        defaultLayout: 'main', 
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
            } 
    }));
    app.set('view engine', 'handlebars');

    // bootstrap - public
    app.use(express.static(path.join(__dirname + "/public")));

    // mongoose
    mongoose.connect('mongodb://localhost/ttapp')
    .then(() => {
        console.log('mongodb conectado!');
    }).catch((err) => {
        console.log('erro ao conectar com o banco!')
    });


/// Rotas
app.get('/', (req, res) => {
    res.render('public/index');
});

    // usuarios
    const usuario = require('./routes/usuarios');
    app.use('/usuarios', usuario);

/// Outros
app.listen(PORT, () => {
    console.log('servidor está rodando, na porta: ' + PORT);
});


