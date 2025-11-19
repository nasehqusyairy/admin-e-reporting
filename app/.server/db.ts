import mysql from 'mysql2/promise';

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'test';
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

// Create the connection pool. The pool-specific settings are the defaults
export const pool = mysql.createPool({ host, user, password, database, port });