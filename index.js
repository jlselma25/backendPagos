const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


app.use(cors());
app.use(express.json());
//const server = require('http').createServer(app);

// Configurar rutas
app.use('/PAGOS', require('./routes/pagos'));

app.listen(process.env.PORT, (err) => {
    if (err) throw new Error(err);
    console.log('Servidor corriendo en puerto', process.env.PORT);
});