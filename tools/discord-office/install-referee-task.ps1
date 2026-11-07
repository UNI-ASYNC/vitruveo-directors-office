# Install Vitruveo Office Sentinel referee as a background task at Windows sign-in.
# Requires Windows PowerShell 5.1, Node installed, no administrator rights.
# Never places the token into task command line, registry Run key, or repository.
param([switch]$Status,[switch]$Stop,[switch]$Uninstall)
$ErrorActionPreference = "Stop"
$taskName = "Vitruveo Office Sentinel Referee"
$dir = $PSScriptRoot
$data = Join-Path $env:LOCALAPPDATA "VitruveoOfficeSentinel"
$tokenFile = Join-Path $data "office-token.xml"
$worker = Join-Path $dir "run-referee-task.ps1"
if ($Status) {
  $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  if (!$task) { Write-Host "NOT INSTALLED"; return }
  $info = $task | Get-ScheduledTaskInfo
  Write-Host "TASK: $taskName"
  Write-Host "State: $($task.State) | Last result: $($info.LastTaskResult)"
  Write-Host "Last run: $($info.LastRunTime)"
  Write-Host "Log: $(Join-Path $data 'referee.log')"
  return
}
if ($Stop) {
  Stop-ScheduledTask -TaskName $taskName -ErrorAction Stop
  Write-Host "Task stopped. Check Task Manager for any remaining node.exe from the old console."
  return
}
if ($Uninstall) {
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host "Scheduled task removed. Encrypted token remains at $tokenFile (delete separately if desired)."
  return
}
if (!(Test-Path $worker)) { throw "Worker missing: $worker" }
if (!(Get-Command node.exe -ErrorAction SilentlyContinue)) { throw "node.exe not found in your PATH." }
if (!(Test-Path (Join-Path $dir "beef-referee.mjs"))) { throw "Referee script missing." }
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
  throw "Task already installed; refused duplicate. Use -Status, -Stop, or -Uninstall."
}
New-Item -ItemType Directory -Path $data -Force | Out-Null
$secure = Read-Host "Office Sentinel BOT TOKEN (encrypted; not displayed)" -AsSecureString
if ($secure.Length -eq 0) { throw "Empty token rejected" }
# Export-Clixml uses Windows DPAPI bound to current user/machine.
$secure | Export-Clixml -Path $tokenFile
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$exe = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$arg = '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $worker + '"'
$action = New-ScheduledTaskAction -Execute $exe -Argument $arg -WorkingDirectory $dir
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $identity
$principal = New-ScheduledTaskPrincipal -UserId $identity -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
try {
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Vitruveo Directors Office Forum-only Beef Room referee; run at user sign-in." -ErrorAction Stop | Out-Null
} catch {
  Write-Host "Registration failed. Encrypted token file is still saved at $tokenFile."
  throw
}
Write-Host "INSTALLED: $taskName (runs at sign-in as $identity)."
Write-Host "Start it now with: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "Status: .\install-referee-task.ps1 -Status"
Write-Host "Log: $(Join-Path $data 'referee.log')"
Write-Host "IMPORTANT: Stop the currently LISTENING PowerShell referee with Ctrl+C BEFORE starting this task."
