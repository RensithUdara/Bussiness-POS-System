const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    const schemaPath = path.join(__dirname, 'lib', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Try different connection approaches
    const connectionConfigs = [
        // Try 1: Use .env.local credentials
        {
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD || '',
            name: 'env'
        },
        // Try 2: No password (some default MySQL installations)
        {
            host: 'localhost',
            user: 'root',
            password: '',
            name: 'no-password'
        },
        // Try 3: Common default password
        {
            host: 'localhost',
            user: 'root',
            password: 'root',
            name: 'default-root'
        },
    ];

    let connection = null;
    let successConfig = null;

    for (const config of connectionConfigs) {
        try {
            console.log(`Trying connection: ${config.name}...`);
            connection = await mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password,
            });
            successConfig = config;
            console.log(`✓ Connected using: ${config.name}`);
            break;
        } catch (err) {
            console.log(`✗ Failed: ${err.message}`);
        }
    }

    if (!connection) {
        console.error('\n❌ Could not connect to MySQL server');
        console.error('\nPlease configure your MySQL connection:');
        console.error('\n1. Open MySQL Shell or MySQL Workbench');
        console.error('2. Connect with credentials and run:');
        console.error('\nCREATE DATABASE IF NOT EXISTS pos_system;');
        console.error('USE pos_system;');
        console.error('SOURCE g:\\POS-System\\lib\\schema.sql;');
        console.error('\n3. Then update .env.local with your password:');
        console.error('DB_PASSWORD=your_mysql_password');
        console.error('\n4. Finally run: npm run dev');
        process.exit(1);
    }

    try {
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

        let created = 0;
        for (const statement of statements) {
            try {
                await connection.execute(statement);
                created++;
            } catch (err) {
                // Ignore "Table already exists" errors
                if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
                    console.error('Error executing:', statement.substring(0, 50));
                    console.error(err.message);
                }
            }
        }

        console.log(`✓ Created ${created} database objects`);

        // Update .env.local if using a different password
        if (successConfig.password && successConfig.password !== (process.env.DB_PASSWORD || '')) {
            const envPath = path.join(__dirname, '.env.local');
            let envContent = fs.readFileSync(envPath, 'utf-8');
            envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${successConfig.password}`);
            fs.writeFileSync(envPath, envContent);
            console.log(`✓ Updated .env.local with password`);
        }

        console.log('\n✅ Database setup complete!');
        console.log('You can now run: npm run dev\n');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();
