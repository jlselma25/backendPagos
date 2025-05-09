const { response } = require('express');
const { generarJWT,comprobarJWTPorSocketIO } = require('../helpers/jwt');
const { executeQuery } = require('../database/operations');
const bcryptjs = require('bcryptjs');
const moment = require('moment');



ObtenerSaldo = async(req, res = response ) => {
   
    const { usuario } = req.query;   

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
    //query ="SELECT password,email,id FROM TableU WHERE email='23'or 1=1--'";
    
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


   CargarCategorias= async(req, res = response ) => {  

    try{
        const query ="SELECT numero, nombre FROM TableC";       
        const data = await executeQuery(query);         
        const mappedData = data.map(row => ({
            numero: row.numero, 
            nombre: row.nombre 
        }));
       
        return res.json(mappedData);


    }catch(error){
        return res.json({
            numero: '0',
            nombre: ''
        });
    }   
  
   }

   GuardarRegistro = async(req, res = response ) => {
    const token = req.header('x-token');
    const { tipo,importe,concepto,id,categoria} = req.query; 
    const ahora = new Date(); 
    const fecha = formatoFecha(ahora);   
    const fechaFormateada = moment(fecha, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');  
   
    let query;
    let saldo = 0;  
  
   
   try{
        query = "SELECT TOP 1 saldo FROM tableP ORDER BY Id DESC";
        const rows = await executeQuery(query);  

        if (rows.length == 0){           
            saldo  =  tipo == 1 ?  importe : importe * -1;
        }else{
            saldo = tipo == 1  ? rows[0].saldo + parseFloat(importe.replace(',', '.')) : rows[0].saldo - parseFloat(importe.replace(',', '.'));
        }      
        
        query ="INSERT INTO tableP (fecha,importe,tipo,concepto,usuario,saldo,categoria) VALUES ('" + fechaFormateada + "',"+ importe.replace(',', '.') + ",'" + tipo + "','" + concepto + "'," + id + "," + saldo + "," + categoria + ")";
                       
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
      

        const query ="SELECT P.*, C.Leyenda leyenda FROM TableP P JOIN TableC C  ON P.Categoria = C.Numero  WHERE Fecha >='" + fechaFrom + " 0:00:00'  AND Fecha <= '" + fechaTo + " 23:59:59' AND Usuario =" + usuario + " ORDER BY Id DESC";     
           
        const data = await executeQuery(query);  
       
        const mappedData = data.map(row => ({           
            importe: row.importe,
            fecha:  moment(row.fecha, 'YYYY-MM-DD').format('DD/MM/YYYY'),
            tipo:  row.tipo == 1 ? 'I' : 'P',
            nombre:row.concepto,
            token:'',
            id: row.id,
            leyenda: row.leyenda
          

        }));

        return res.json(mappedData);


    }catch(error){      

        return res.json({
            importe: -1,
            fecha:  '',
            tipo:''  ,
            nombre:'',
            token:'0',
            id: -1 ,
            
        });
    }   
  
   }


   EliminarRegistro = async(req, res = response ) => {      
    
   
    const { id , importe} = req.query;      
  
  
    
    let query ="DELETE FROM TableP WHERE id=" + id ;   
    data = await executeQuery(query);   


    query ="SELECT TOP 1 id, saldo FROM TableP ORDER BY Id DESC" ;   

    data = await executeQuery(query);      

    if(data.length > 0){

        query = "UPDATE TableP SET Saldo = Saldo +  " +  importe + " WHERE id =" + data[0].id;       
        await executeQuery(query);   
              
    }
    
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


   ComprobarUsuario = async(req, res = response ) => {  

        const token = req.header('x-token');
        const valor = await comprobarJWTPorSocketIO(token);  

        if (valor == '0'){   
            return res.json({
                valor: '0',
                token: '',
                id: -1
            });
        }

        return res.json({
            valor: '1',
            token: 'token',
            id: -1
        });

   }

   ComprobarToken = async(req, res = response ) => {  

    const token = req.header('x-token');   
    const valor = await comprobarJWTPorSocketIO(token);  

    if (valor == '0'){   
        return res.json({
            valor: '0',
            token: '',
            id: -1
        });
    }

    return res.json({
        valor: '1',
        token: 'token',
        id: -1
    });

}



ObtenerEstadisticas = async(req, res = response ) => {  

    try{
       
        const token = req.header('x-token');
       
        const { usuario,fechaDesde,fechaFin} = req.query; 
       

        const fechaFrom = moment(fechaDesde, 'DD/MM/YYYY').format('YYYY-MM-DD');  
        const fechaTo = moment(fechaFin, 'DD/MM/YYYY').format('YYYY-MM-DD');        

        // const query ="SELECT SUM(resul.Importe) importe,resul.leyenda leyenda , resul.nombre nombre, resul.numero " +

        //             " FROM ("        +
        //                       " SELECT SUM(Importe) importe, C.Leyenda leyenda, C.Nombre nombre, C.Numero numero FROM TableP TP JOIN TableC C ON TP.Categoria = C.Numero "        +
        //                       " WHERE Fecha >='" + fechaFrom + " 0:00:00'  AND Fecha <= '" + fechaTo + " 23:59:59' AND Usuario =" + usuario + "  AND Tipo = 2 GROUP BY C.Leyenda, C.Nombre, C.Numero"  +

        //                       " UNION ALL "  +

        //                        "SELECT SUM(Importe) * -1  importe, C.Leyenda leyenda, C.Nombre nombre,  C.Numero numero FROM TableP TP JOIN TableC C ON TP.Categoria = C.Numero "  +        
        //                        " WHERE Fecha >='" + fechaFrom + " 0:00:00'  AND Fecha <= '" + fechaTo + " 23:59:59' AND Usuario =" + usuario + "  AND Tipo = 1 GROUP BY C.Leyenda, C.Nombre, C.Numero"  +

        //              " ) as resul   GROUP BY resul.leyenda, resul.nombre, resul.numero"
            
        //     ;               

        const query=  " SELECT SUM(Importe) importe, C.Leyenda leyenda, C.Nombre nombre, C.Numero numero FROM TableP TP JOIN TableC C ON TP.Categoria = C.Numero "        +
        " WHERE Fecha >='" + fechaFrom + " 0:00:00'  AND Fecha <= '" + fechaTo + " 23:59:59' AND Usuario =" + usuario + "  AND Tipo = 2 GROUP BY C.Leyenda, C.Nombre, C.Numero";

      

            
        const data = await executeQuery(query);       
       
        const mappedData = data.map(row => ({           
            importe: row.importe,           
            leyenda: row.leyenda,
            nombre: row.nombre,
            numero: row.numero


        }));
           
        return res.json(mappedData);


    }catch(error){      
        console.log('paso');
        return res.json({
            importe: -1,           
            leyenda: '',
            nombre: '',
            numero: -1
        });
    }   
  
   }

   CargarRegistrosFechasPorLeyenda = async(req, res = response ) => {  

    try{
       
        const token = req.header('x-token');
       
        const { usuario,fechaDesde,fechaFin,numero} = req.query; 

        const fechaFrom = moment(fechaDesde, 'DD/MM/YYYY').format('YYYY-MM-DD');  
        const fechaTo = moment(fechaFin, 'DD/MM/YYYY').format('YYYY-MM-DD');  
      

        const query ="SELECT P.* FROM TableP P  WHERE  Tipo <> 1 AND Categoria = " + numero + " AND Fecha >='" + fechaFrom + " 0:00:00'  AND Fecha <= '" + fechaTo + " 23:59:59' AND Usuario =" + usuario + " ORDER BY Id DESC";     
           
        const data = await executeQuery(query);  
       
        const mappedData = data.map(row => ({           
            importe: row.importe,          
            nombre:row.concepto,
        }));

        return res.json(mappedData);


    }catch(error){      

        return res.json({
            importe: -1,            
            nombre:'',            
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
    ObtenerSaldo,
    ComprobarUsuario,
    ComprobarToken,
    CargarCategorias,
    ObtenerEstadisticas,
    CargarRegistrosFechasPorLeyenda
 }