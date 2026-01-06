# credit-deposit.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$WalletAddress,
    
    [Parameter(Mandatory=$true)]
    [string]$Currency,
    
    [Parameter(Mandatory=$true)]
    [string]$Chain,
    
    [Parameter(Mandatory=$true)]
    [decimal]$Amount,
    
    [Parameter(Mandatory=$true)]
    [string]$TxHash,
    
    [Parameter(Mandatory=$true)]
    [string]$FromAddress
)

$headers = @{
    "Content-Type" = "application/json"
    "x-api-secret" = "8fbb638e5148fcb0d3ca47244744bac2ffc53fee9b26dbd864eedad374b22f7e"
}

$body = @{
    walletAddress = $WalletAddress
    currency = $Currency
    chain = $Chain
    amount = $Amount
    txHash = $TxHash
    fromAddress = $FromAddress
} | ConvertTo-Json

Write-Host "Crediting deposit..." -ForegroundColor Yellow
Write-Host "Wallet: $WalletAddress"
Write-Host "Amount: $Amount $Currency"
Write-Host "TxHash: $TxHash"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/credit-deposit" `
        -Method POST `
        -Headers $headers `
        -Body $body
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Deposit ID: $($response.deposit.depositId)"
    Write-Host "New Balance: $($response.balance.available) $($response.balance.currency)"
    Write-Host "User: $($response.user.email)"
    
} catch {
    Write-Host "Error!" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Message: $($errorDetails.error)"
    Write-Host "Details: $($errorDetails.details)"
}