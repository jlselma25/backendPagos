const jwt = require('jsonwebtoken');




const generarJWT = (uid) => {


    return new Promise((resolve,reeject) => {

        const payload = { uid }

        jwt.sign(payload,process.env.JWT_KEY,{
            expiresIn:'24h'
        },(err,token ) => {
    
            if (err){
                reeject('No se pudo generar el JWT');
            }
            else
            {
                resolve( token );
            }   
    
        });

    });  

}

const comprobarJWTPorSocketIO = (token = '') => {

    try {

       

        const { uid } = jwt.verify(token, process.env.JWT_KEY);
       // req.uid = uid;

    //   return [true, uid];
       return '1';

    } catch (error) {
        return '0';
    
    }
        
}


// const verificarJWT = (token) => {
//     return new Promise((resolve, reject) => {
//         jwt.verify(token, process.env.SECRETORPRIVATEKEY, (err, decoded) => {
//             if (err) {
//                 console.log('❌ Token inválido o expirado:', err.message);
//                 reject('Token no válido');
//             } else {
//                 console.log('✅ Token válido, payload:', decoded);
//                 resolve(decoded); // Devuelve el payload decodificado (uid, etc.)
//             }
//         });
//     });
// };





module.exports = {
    generarJWT,
    comprobarJWTPorSocketIO
}