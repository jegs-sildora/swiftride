<?php
header('Content-Type: text/plain');

echo "=== SWIFTRIDE DB DIAGNOSTIC ===\n";
echo "DB_CONNECTION: " . getenv('DB_CONNECTION') . "\n";
echo "DB_URL (masked): " . preg_replace('/:[^@]+@/', ':****@', getenv('DB_URL')) . "\n";
echo "DB_SCHEMA: " . getenv('DB_SCHEMA') . "\n";

try {
    $dbUrl = getenv('DB_URL');
    if (!$dbUrl) {
        throw new Exception("DB_URL is not set");
    }
    
    $parsed = parse_url($dbUrl);
    $host = $parsed['host'] ?? '';
    $port = $parsed['port'] ?? 5432;
    $user = $parsed['user'] ?? '';
    $pass = $parsed['pass'] ?? '';
    $path = ltrim($parsed['path'] ?? '', '/');
    
    $dbAndParams = explode('?', $path);
    $dbname = 'swiftride_auth_db';
    
    echo "Connecting to Host: $host, Port: $port, DB: $dbname, User: $user\n";
    
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5
    ]);
    echo "Connected successfully to database $dbname!\n";
    
    $schema = getenv('DB_SCHEMA') ?: 'public';
    echo "Using schema: $schema\n";
    
    if ($schema !== 'public') {
        $pdo->exec("CREATE SCHEMA IF NOT EXISTS \"$schema\"");
        echo "Schema '$schema' created/verified successfully.\n";
    }
    
    $stmt = $pdo->prepare("SELECT table_name FROM information_schema.tables WHERE table_schema = :schema");
    $stmt->execute(['schema' => $schema]);
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables in '$schema' schema: " . implode(', ', $tables) . "\n";
    
    $stmt = $pdo->query("SELECT datname FROM pg_database");
    $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "All databases on server: " . implode(', ', $dbs) . "\n";
    
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
