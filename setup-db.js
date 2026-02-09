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
        const rawStatements = schemaSQL.split(';');
        console.log(`Raw split produced ${rawStatements.length} parts\n`);

        const statements = [];
        const filtered = [];

        for (const stmt of rawStatements) {
            const trimmed = stmt.trim();
            if (trimmed.length === 0) {
                continue; // Skip empty statements
            }

            // Remove leading comment lines but keep the CREATE statement
            const lines = trimmed.split('\n');
            const withoutComments = lines.filter(line => !line.trim().startsWith('--')).join('\n').trim();

            if (withoutComments.length > 0) {
                statements.push(withoutComments);
            }
        }

        console.log(`After filtering: ${statements.length} statements\n`);

        // Debug: Show first 100 chars of each statement
        statements.forEach((stmt, idx) => {
            const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
            const type = stmt.includes('CREATE INDEX') ? '📇' : stmt.includes('CREATE TABLE') ? '📋' : '❓';
            console.log(`  ${type} ${idx + 1}. ${preview}...`);
        });
        console.log('');

        let created = 0;
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            const isCreateTable = statement.toLowerCase().includes('create table');
            const isCreateIndex = statement.toLowerCase().includes('create index');

            try {
                if (isCreateIndex) {
                    console.log(`  ⏭  Skipping: ${statement.substring(0, 50)}...`);
                    continue;
                }

                console.log(`  ⚙  Executing: ${statement.substring(0, 50)}...`);
                await connection.execute(statement);
                created++;

                if (isCreateTable) {
                    const tableName = statement.match(/create table[\s`]*if[\s]*not[\s]*exists[\s`]*(\w+)/i)?.[1] || 'unknown';
                    console.log(`  ✓ Created table: ${tableName}`);
                } else {
                    console.log(`  ✓ Executed statement ${created}`);
                }
            } catch (err) {
                console.error(`  ✗ Error on statement ${i + 1}:`);
                console.error(`    ${err.code}: ${err.message}`);
            }
        }

        console.log(`\n✓ Successfully created ${created} database objects`);

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
