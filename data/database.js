const mysql = require('mysql2/promise');

const pool = mysql.createPool({
 host: 'localhost',
 database: 'block',
 user: 'root',
 password: 'woken123'
});

module.exports = pool;