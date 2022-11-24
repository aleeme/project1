var mysql = require("mysql");
require("dotenv").config();

var connection = mysql.createConnection({
    connectionLimit: 5,
    host: process.env.DB_HOST || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB || '',
    port: process.env.DB_PORT || '..',
});
connection.connect((err) => {
    console.log("try connect to DB...");
    if (err) throw err;
    else console.log("complete !");
});

module.exports = connection;