



const config=  {
    user: 'sa',
    password: 'pk',
 //   server: '192.168.1.200', 
   server:'supercarmelaoficina.dvrdns.org',   
    database: 'Prueba',
    port: 1433,
    options: {
        encrypt: false, // Usa `true` si tu servidor requiere encriptación
        trustServerCertificate: false // Usa `true` si confías en el certificado del servidor
    }
};



// const config=  {
//     user: 'sa',
//     password: 'Adm1357',
//     //server: 'SERVIDORNEW', 
//     server:'devexp.ddns.net',
//     database: 'Catering',
//     port: 1444,
//     options: {
//         encrypt: false, // Usa `true` si tu servidor requiere encriptación
//         trustServerCertificate: false // Usa `true` si confías en el certificado del servidor
//     }
// };





/*const config=  {
    user: 'sa',
    password: 'pk',
    server: 'SERVIDORNEW', 
   // server:'213.194.175.18',
    database: 'versionesBD',
    port: 1433,
    options: {
        encrypt: false, // Usa `true` si tu servidor requiere encriptación
        trustServerCertificate: false // Usa `true` si confías en el certificado del servidor
    }
};*/

module.exports = { config };




module.exports = { config };