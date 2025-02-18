const { Router } = require('express');
const { LoginUsuario,RegistroUsuario,CargarTipos,GuardarRegistro} = require('../controllers/pagos');


const router = Router();


router.get('/LoginUsuario/', LoginUsuario );
router.get('/RegistroUsuario/', RegistroUsuario );
router.get('/CargarTipos/', CargarTipos );
router.get('/GuardarRegistro/', GuardarRegistro );



module.exports = router;