const { Router } = require('express');
const { LoginUsuario,RegistroUsuario,CargarTipos,GuardarRegistro,ListadoRegistrosFechas,EliminarRegistro} = require('../controllers/pagos');


const router = Router();


router.get('/LoginUsuario/', LoginUsuario );
router.get('/RegistroUsuario/', RegistroUsuario );
router.get('/CargarTipos/', CargarTipos );
router.get('/GuardarRegistro/', GuardarRegistro );
router.get('/ListadoRegistrosFechas/', ListadoRegistrosFechas );
router.get('/EliminarRegistro/', EliminarRegistro );



module.exports = router;