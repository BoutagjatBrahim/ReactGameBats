import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion : ' + err.stack);
        return;
    }
    console.log('Connecté avec succès à la base de données en tant que ' + connection.threadId);
});

// N'oublie pas de fermer la connexion
connection.end();
