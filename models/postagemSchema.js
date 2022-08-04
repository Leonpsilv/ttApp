const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagem = new Schema({
    conteudo : {
        type : String,
        required : true
    },
    usuario : {
        type : Schema.Types.ObjectId, // por meio do id do usuario
        ref : "usuarios", // conseguimos fazer relação com a collection usuarios
        required : true
    }
});

mongoose.model('postagens', Postagem);