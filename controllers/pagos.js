const { response } = require('express');
const { generarJWT,comprobarJWTPorSocketIO } = require('../helpers/jwt');
const { executeQuery } = require('../database/operations');
const bcryptjs = require('bcryptjs');
const moment = require('moment');





 LoginUsuario = async(req, res = response ) => {

    let token = req.header('x-token');
    let row ;
    let query;
    let esCorrecta;
    let data;
    
    const { email,pass,codigo } = req.query;
   
    const valor = await comprobarJWTPorSocketIO(token);
    query ="SELECT password,email,id FROM TableU WHERE email='" + email +  "'";
    data = await executeQuery(query);  
    row = data[0]; //

    if (valor == '0'){       
      
        if (data.length > 0)
        {          
            token = await generarJWT( codigo );
            esCorrecta = await bcryptjs.compare(pass, row.password);
        }
        return res.json({
            valor: esCorrecta ? '1' : '0',
            token: token,
            id:row.id
        });
    }        
 
    esCorrecta = await bcryptjs.compare(pass, row.password);   
    console.log(row.password); 
  
    return res.json({
        valor: esCorrecta ? '1' : '0',
        token: '',
        id:row.id
    });
      
  
   }


   RegistroUsuario = async(req, res = response ) => {

    const { codigo,email,password} = req.query; 
   
    const token = await generarJWT( codigo );
    const salt = bcryptjs.genSaltSync();
    const pass = bcryptjs.hashSync( password, salt );

    try{
        let query ="INSERT INTO tableU (email,password,token) VALUES ('" + email + "','" + pass + "','" + token + "')";
        await executeQuery(query);  
        query ="SELECT TOP 1 id FROM tableU ORDER BY Id DESC";
        const  data =   await executeQuery(query);       
        row = data[0]; //
         return res.json({
            valor: '1',
            token: token,
            id:row.id
        });
    }catch(error){
        console.log(error);
        return res.json({
            valor: '0',
            token: '',
            id: -1
        });
    }   
  
   }



   CargarTipos = async(req, res = response ) => {  

    try{
        const query ="SELECT * FROM TableT";
        const data = await executeQuery(query);  
       
        const mappedData = data.map(row => ({
            id: row.id, 
            nombre: row.nombre 
        }));

        return res.json(mappedData);


    }catch(error){
        return res.json({
            id: '0',
            nombre: ''
        });
    }   
  
   }

   GuardarRegistro = async(req, res = response ) => {
    const token = req.header('x-token');
    const { tipo,importe,concepto,id} = req.query; 
    const ahora = new Date(); 
    const fecha = formatoFecha(ahora);   
   const fechaFormateada = moment(fecha, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');    
   const valor = await comprobarJWTPorSocketIO(token);
  
   if (valor == '0'){   
        return res.json({
            valor: '0',
            token: '',
            id: -1
        });
   }
   
   try{
        const query ="INSERT INTO tableP (fecha,importe,tipo,concepto,usuario) VALUES ('" + fechaFormateada + "',"+ importe.replace(',', '.') + ",'" + tipo + "','" + concepto + "'," + id + ")";
        console.log(query);
        await executeQuery(query);  
         return res.json({
            valor: '1',
            token: 'token',
            id: -1
        });
    }catch(error){
        console.log(error);
        return res.json({
            valor: '0',
            token: '',
            id: -1
        });
    }   
  
   }


   function formatoFecha(fecha){
       
    const dd = String(fecha.getUTCDate()).padStart(2, '0');
    const mm = String(fecha.getUTCMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const yyyy = fecha.getUTCFullYear();
    const hh =String(fecha.getHours()).padStart(2, '0');
   // const hh = String(fecha.getUTCHours()).padStart(2, '0'); // **Obtener la hora en UTC**
    const min = String(fecha.getUTCMinutes()).padStart(2, '0');
    const ss = String(fecha.getUTCSeconds()).padStart(2, '0');


    let fechaNueva = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min + ':' + ss;

    return fechaNueva;
 }


   module.exports = {       
    LoginUsuario, 
    RegistroUsuario,
    CargarTipos,
    GuardarRegistro
 }