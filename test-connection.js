import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: 'auth-db1493.hstgr.io',
  user: 'u625627287_enterprise',
  password: 'U2r*9qQb',   // Replace with your correct password
  database: 'u625627287_enterprise',
});

connection.connect((err) => {
  if (err) {
    return console.error('Connection error:', err.message);
  }
  console.log('✅ Connected to MySQL!');
  connection.end();
});
