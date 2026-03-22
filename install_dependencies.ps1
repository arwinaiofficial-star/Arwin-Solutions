Write-Host "Installing Node.js..."
winget install --id OpenJS.NodeJS -e --source winget

Write-Host "Installing Python..."
winget install --id Python.Python.3.11 -e --source winget

Write-Host "Installing Docker Desktop..."
winget install --id Docker.DockerDesktop -e --source winget

Write-Host "Installation complete. Please close this terminal and open a new one to refresh your PATH."
