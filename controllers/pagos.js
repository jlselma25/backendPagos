const { response } = require('express');
const { generarJWT,comprobarJWTPorSocketIO } = require('../helpers/jwt');
const { executeQuery } = require('../database/operations');
const bcryptjs = require('bcryptjs');
const moment = require('moment');



ObtenerSaldo = async(req, res = response ) => {
    let token = req.header('x-token');
    const valor = await comprobarJWTPorSocketIO(token);
    const { usuario } = req.query;
  

    if (valor == '0'){    

        return res.send(-999999);
    }

    const query ="SELECT TOP 1 saldo FROM TableP WHERE usuario=" +  usuario + " ORDER BY Id DESC";
   
    const  data = await executeQuery(query);  
    return res.json(data[0].saldo);
}

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
    
    if (data.length == 0){
        return res.json({
            valor:  '0',
            token: token,
            id: -1
        });
    }

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
    token = await generarJWT( codigo );
    esCorrecta = await bcryptjs.compare(pass, row.password);   
    console.log(row.password); 
  
    return res.json({
        valor: esCorrecta ? '1' : '0',
        token: token,
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
    let query;
    let saldo = 0;

 

  
   if (valor == '0'){   
        return res.json({
            valor: '0',
            token: '',
            id: -1
        });
   }
   
   try{


        query = "SELECT TOP 1 saldo FROM tableP ORDER BY Id DESC";
        const rows = await executeQuery(query);  

        if (rows.length == 0){           
            saldo  =  tipo == 1 ?  importe : importe * -1;
        }else{
            saldo = tipo == 1  ? rows[0].saldo + parseFloat(importe.replace(',', '.')) : rows[0].saldo - parseFloat(importe.replace(',', '.'));
        }      
        
        query ="INSERT INTO tableP (fecha,importe,tipo,concepto,usuario,saldo) VALUES ('" + fechaFormateada + "',"+ importe.replace(',', '.') + ",'" + tipo + "','" + concepto + "'," + id + "," + saldo + ")";
                       
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


 ListadoRegistrosFechas = async(req, res = response ) => {  

    try{
       
        const token = req.header('x-token');
       
        const { usuario,fechaDesde,fechaFin} = req.query; 

        const fechaFrom = moment(fechaDesde, 'DD/MM/YYYY').format('YYYY-MM-DD');  
        const fechaTo = moment(fechaFin, 'DD/MM/YYYY').format('YYYY-MM-DD');  
        const valor = await comprobarJWTPorSocketIO(token);           

  
        if (valor == '0'){   
            
             return res.json({                 
                importe: -1,
                fecha:  '',
                tipo:''  ,
                nombre:'',
                token:'3'                
             });
        }

        const query ="SELECT * FROM TableP WHERE Fecha >='" + fechaFrom + " 0:00:00'  AND Fecha <= '" + fechaTo + " 23:59:59' AND Usuario =" + usuario;     

        const data = await executeQuery(query);  
       
        const mappedData = data.map(row => ({           
            importe: row.importe,
            fecha:  moment(row.fecha, 'YYYY-MM-DD').format('DD/MM/YYYY'),
            tipo:  row.tipo == 1 ? 'I' : 'P',
            nombre:row.concepto,
            token:'',
            id: row.id

        }));

        return res.json(mappedData);


    }catch(error){      

        return res.json({
            importe: -1,
            fecha:  '',
            tipo:''  ,
            nombre:'',
            token:'0',
            id: -1    
        });
    }   
  
   }


   EliminarRegistro = async(req, res = response ) => {    
   
    
    const { id } = req.query;      
    const query ="DELETE FROM TableP WHERE id=" + id ;   
    data = await executeQuery(query);   
    
    try{    
        return res.json({
            valor: '1',
            token: '',
            id: -1
        });
    
        }catch(error){            
            return res.json({
                valor:  '0',
                token: '',
                id:-1
            });
    }     
  
   }



   module.exports = {       
    LoginUsuario, 
    RegistroUsuario,
    CargarTipos,
    GuardarRegistro,
    ListadoRegistrosFechas,
    EliminarRegistro,
    ObtenerSaldo
 }