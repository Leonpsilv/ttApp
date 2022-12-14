const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Usuario = new Schema({
    nome : {
        type : String,
        required : true
    },
    arroba : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    biografia : {
        type : String,
    },
    senha : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now()
    },
    seguindo : {
        type : Array,
        default : []
    },
    seguidores : {
        type : Array,
        default : []
    }
});

mongoose.model('usuarios', Usuario);