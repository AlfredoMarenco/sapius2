<?php

$dir = __DIR__ . '/database/migrations/';
$files = glob($dir . '*.php');

foreach ($files as $file) {
    // Skip the ones we already did
    if (strpos($file, '0001_') !== false) {
        continue;
    }

    $content = file_get_contents($file);
    
    // Find all occurrences of Schema::create(
    $offset = 0;
    while (($pos = strpos($content, "Schema::create('", $offset)) !== false) {
        $startTableName = $pos + 16;
        $endTableName = strpos($content, "'", $startTableName);
        $tableName = substr($content, $startTableName, $endTableName - $startTableName);
        
        // Find the opening brace of the closure
        $closureStart = strpos($content, "{", $endTableName);
        
        // Find the matching closing brace
        $braceCount = 1;
        $currentPos = $closureStart + 1;
        while ($braceCount > 0 && $currentPos < strlen($content)) {
            if ($content[$currentPos] === '{') {
                $braceCount++;
            } elseif ($content[$currentPos] === '}') {
                $braceCount--;
            }
            $currentPos++;
        }
        
        // $currentPos is now right after the closing brace of the closure.
        // It's usually followed by `);`
        $semicolonPos = strpos($content, ";", $currentPos);
        
        // We need to inject `if (!Schema::hasTable('$tableName')) {` before $pos
        // And `}` after $semicolonPos
        
        $prefix = "if (!Schema::hasTable('$tableName')) {\n            ";
        $suffix = "\n        }";
        
        $content = substr($content, 0, $pos) 
                 . $prefix 
                 . substr($content, $pos, $semicolonPos - $pos + 1)
                 . $suffix
                 . substr($content, $semicolonPos + 1);
                 
        // Move offset past this block
        $offset = $semicolonPos + strlen($prefix) + strlen($suffix);
    }
    
    file_put_contents($file, $content);
    echo "Processed: " . basename($file) . "\n";
}

echo "All done!\n";
