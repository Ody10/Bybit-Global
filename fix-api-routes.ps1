# List of all API route files that need fixing
$files = @(
    "app\api\admin\credit-deposit\route.ts",
    "app\api\admin\test-email\route.ts",
    "app\api\auth\check-email\route.ts",
    "app\api\auth\register\route.ts",
    "app\api\auth\send-code\route.ts",
    "app\api\auth\verify-code\route.ts",
    "app\api\cron\deposit-monitor\route.ts",
    "app\api\deposits\monitor\route.ts",
    "app\api\notifications\read-all\route.ts",
    "app\api\trading\orderbook\route.ts",
    "app\api\trading\orders\route.ts",
    "app\api\trading\pairs\route.ts",
    "app\api\trading\positions\route.ts",
    "app\api\user\balances\route.ts",
    "app\api\user\change-password\route.ts",
    "app\api\user\security\route.ts",
    "app\api\user\transfer\route.ts",
    "app\api\user\wallets\route.ts",
    "app\api\withdrawals\verify\route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing: $file"
        
        # Read the file content
        $content = Get-Content $file -Raw
        
        # Replace force-static with force-dynamic
        $content = $content -replace "export const dynamic = 'force-static';", "export const dynamic = 'force-dynamic';"
        
        # Add runtime if not present
        if ($content -notmatch "export const runtime") {
            $content = $content -replace "(export const dynamic = 'force-dynamic';)", "`$1`nexport const runtime = 'nodejs';"
        }
        
        # Remove revalidate line if present
        $content = $content -replace "export const revalidate = false;`r?`n", ""
        
        # Write back to file
        Set-Content $file -Value $content -NoNewline
        
        Write-Host "✓ Fixed: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Cyan