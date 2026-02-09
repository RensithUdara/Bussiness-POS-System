const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const schemaPath = path.join(__dirname, 'lib', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

  try {
    // First, create connection to MySQL server (without specifying database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✓ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'pos_system'}\``);
    console.log('✓ Database created/verified');

    // Select the database
    await connection.changeUser({ database: process.env.DB_NAME || 'pos_system' });
    console.log('✓ Database selected');

    // Split the schema into individual statements and execute them
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        await connection.execute(statement);
      } catch (err) {
        // Ignore "Table already exists" errors
        if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
          console.error('Error executing:', statement.substring(0, 50));
          console.error(err.message);
        }
      }
    }

    console.log('✓ Database schema created successfully');
    console.log('\n✅ Database setup complete! You can now run: npm run dev');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. MySQL Server is running');
    console.error('2. .env.local has correct DB_PASSWORD (if needed)');
    process.exit(1);
  }
}

setupDatabase();
