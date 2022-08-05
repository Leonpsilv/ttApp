const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagem = new Schema({
    conteudo : {
        type : String,
        required : true
    },
    usuario : {
        id : {
            type : Schema.Types.ObjectId, // por meio do id do usuario
            ref : "usuarios", // conseguimos fazer relação com a collection usuarios
            required : true
        },
        nome : {
            type : Schema.Types.String,
            ref : "usuarios",
            required : true
        },
        arroba : {
            type : Schema.Types.String,
            ref : "usuarios",
            required : true
        }
    },
    date : {
        type : Date,
        default : Date.now()
    }
});

mongoose.model('postagens', Postagem);