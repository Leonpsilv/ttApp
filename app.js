const express = require('express');
const app = express();
const PORT = 8081;


/// Rotas
app.get('/', (req, res) => {
    res.send('TUDO CERTO ATÉ AQUI');
});

app.listen(PORT, () => {
    console.log('servidor está rodando, na porta: ' + PORT);
});


