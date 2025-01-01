# Function to check if port is in use
function Test-PortInUse {
    param($port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    } catch {
        return $false
    }
}

# Function to verify service is responding
function Test-ServiceHealth {
    param($url, $maxAttempts = 5)
    for ($i = 1; $i -le $maxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {
            Write-Host ("Attempt {0} failed: {1}" -f $i, $_.Exception.Message) -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
    return $false
}

# Function to start backend service
function Start-BackendService {
    param($name, $port, $directory)
    Write-Host ("`nStarting {0} on port {1}..." -f $name, $port)
    if (-not (Test-PortInUse $port)) {
        try {
            # Check if virtual environment exists
            if (Test-Path "$directory\.venv") {
                Write-Host ("Using existing virtual environment for {0}..." -f $name) -ForegroundColor Yellow
            } else {
                Write-Host ("Creating virtual environment for {0}..." -f $name) -ForegroundColor Yellow
                python -m venv "$directory\.venv"
            }
            
            # Create a script file for this service
            $scriptPath = Join-Path $directory "start_service.ps1"
            @"
cd "$directory"
Write-Host "Activating virtual environment..."
try {
    .\.venv\Scripts\activate
} catch {
    Write-Host "Error activating virtual environment: `$_" -ForegroundColor Red
    exit 1
}

Write-Host "Upgrading pip..."
try {
    python -m pip install --upgrade pip
} catch {
    Write-Host "Error upgrading pip: `$_" -ForegroundColor Red
    exit 1
}

Write-Host "Installing requirements..."
try {
    pip install -r requirements.txt
} catch {
    Write-Host "Error installing requirements: `$_" -ForegroundColor Red
    exit 1
}

Write-Host "Starting service..."
try {
    uvicorn app:app --host 127.0.0.1 --port $port --reload
} catch {
    Write-Host "Error starting service: `$_" -ForegroundColor Red
    exit 1
}
"@ | Out-File -FilePath $scriptPath -Encoding UTF8
            
            # Start the process using the script file
            $process = Start-Process powershell -ArgumentList "-NoExit", "-File", $scriptPath -PassThru -WindowStyle Normal
            
            Start-Sleep -Seconds 20  # Give more time for installation and startup
            if (Test-ServiceHealth "http://localhost:$port/status") {
                Write-Host ("$name started successfully!") -ForegroundColor Green
            } else {
                Write-Host ("$name failed to start properly.") -ForegroundColor Red
                Write-Host "Please check the service window for error messages." -ForegroundColor Yellow
            }
        } catch {
            Write-Host ("Error starting {0}: {1}" -f $name, $_.Exception.Message) -ForegroundColor Red
        }
    } else {
        Write-Host "Port $port is already in use. Please check running processes." -ForegroundColor Yellow
    }
}

# Kill all existing processes first
Write-Host "Cleaning up existing processes..."
@("node", "python", "python3.11", "python3.12") | ForEach-Object {
    $procName = "$_.exe"
    Write-Host "Stopping $procName processes..."
    Start-Process "taskkill" -ArgumentList "/F", "/IM", $procName, "/T" -NoNewWindow -Wait
}

# Close all PowerShell windows except the current one
Write-Host "`nClosing all other PowerShell windows..."
Get-Process | Where-Object { 
    $_.ProcessName -eq "powershell" -and 
    $_.Id -ne $PID -and 
    $_.MainWindowTitle -ne "" 
} | ForEach-Object { 
    Write-Host ("Closing PowerShell window: {0}" -f $_.MainWindowTitle)
    $_.CloseMainWindow() 
}

# Wait for processes to clean up
Write-Host "`nWaiting for processes to clean up..."
Start-Sleep -Seconds 10

# Start Frontend
Write-Host "`nStarting Frontend on port 3000..."
if (-not (Test-PortInUse 3000)) {
    try {
        # Create a script file for frontend
        $frontendScript = Join-Path $PSScriptRoot "start_frontend.ps1"
        @"
cd C:\Users\lfana\Documents\Kwantu\chatai
Write-Host "Installing npm packages..."
npm install
Write-Host "Starting frontend..."
npm start
"@ | Out-File -FilePath $frontendScript -Encoding UTF8

        # Start the frontend process
        $process = Start-Process powershell -ArgumentList "-NoExit", "-File", $frontendScript -PassThru -WindowStyle Normal
        
        Start-Sleep -Seconds 20
        if (Test-ServiceHealth "http://localhost:3000") {
            Write-Host "Frontend started successfully!" -ForegroundColor Green
        } else {
            Write-Host "Frontend failed to start properly." -ForegroundColor Red
            Write-Host "Please check the frontend window for error messages." -ForegroundColor Yellow
        }
    } catch {
        Write-Host ("Error starting Frontend: {0}" -f $_.Exception.Message) -ForegroundColor Red
    }
} else {
    Write-Host "Port 3000 is already in use. Please check running processes." -ForegroundColor Yellow
}

# Start Backend Services
Start-BackendService "PDF Chatbot Backend" 8000 "C:\Users\lfana\Documents\Kwantu\rag-pdf-chatbot"
Start-Sleep -Seconds 5  # Add delay between services
Start-BackendService "SQL Chatbot Backend" 8001 "C:\Users\lfana\Documents\Kwantu\rag-sql-chatbot"
Start-Sleep -Seconds 5  # Add delay between services
Start-BackendService "NLP Demo Backend" 8002 "C:\Users\lfana\Documents\Kwantu\nlp-demo"

Write-Host "`nAll services have been started. Check the individual terminal windows for detailed logs." 