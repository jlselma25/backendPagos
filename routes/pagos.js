const { Router } = require('express');
const { LoginUsuario,RegistroUsuario,CargarTipos,GuardarRegistro,ListadoRegistrosFechas,EliminarRegistro,ObtenerSaldo,ComprobarUsuario,ComprobarToken,CargarCategorias,ObtenerEstadisticas} = require('../controllers/pagos');


const router = Router();


router.get('/LoginUsuario/', LoginUsuario );
router.get('/RegistroUsuario/', RegistroUsuario );
router.get('/CargarTipos/', CargarTipos );
router.get('/GuardarRegistro/', GuardarRegistro );
router.get('/ListadoRegistrosFechas/', ListadoRegistrosFechas );
router.get('/EliminarRegistro/', EliminarRegistro );
router.get('/ObtenerSaldo/', ObtenerSaldo );
router.get('/ComprobarUsuario/', ComprobarUsuario );
router.get('/ComprobarToken/', ComprobarToken );
router.get('/CargarCategorias/', CargarCategorias );
router.get('/ObtenerEstadisticas/', ObtenerEstadisticas );



module.exports = router;