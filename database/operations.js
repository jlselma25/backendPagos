// dbOperations.js
const sql = require('mssql');
const { config } = require('../database/config');

async function executeQuery(query) {
    let pool;
    try {
        // Conectar a la base de datos     
      
        pool = await sql.connect(config);     
        
        // Ejecutar la consulta
        const result = await sql.query(query);       
        
        return result.recordset; // Retornar los registros obtenidos
    } catch (err) {
      
        console.error('Error al ejecutar la consulta:', err);
        throw err;
    } finally {     
       
        if (pool) {
            await pool.close();
        }
    }
}

module.exports = { executeQuery };