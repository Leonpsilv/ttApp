    // Router
const express = require('express');
const router = express.Router();
    // Mongoose
const mongoose = require('mongoose');
    // Postagem Model
require('../models/postagemSchema');
const Postagem = mongoose.model('postagens');

