# Vitruveo Office Sentinel -- background referee worker.
# Runs under the same Windows account that installed the scheduled task.
# Token is encrypted with Windows DPAPI and never passed as a command-line argument.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dir = $PSScriptRoot
$data = Join-Path $env:LOCALAPPDATA "VitruveoOfficeSentinel"
$tokenFile = Join-Path $data "office-token.xml"
$log = Join-Path $data "referee.log"
$env:DISCORD_GUILD_ID = "1020154218029531197"
$env:DISCORD_BEEF_REFEREE_CONFIRM = "RUN_FORUM_ONLY_REFEREE"
Set-Location $dir
$node = (Get-Command node.exe -ErrorAction Stop).Source
while ($true) {
  try {
    if (!(Test-Path $tokenFile)) { throw "No encrypted token file. Run install-referee-task.ps1 first." }
    $secure = Import-Clixml -Path $tokenFile
    $env:DISCORD_BOT_TOKEN = [System.Net.NetworkCredential]::new("", $secure).Password
    if ([string]::IsNullOrWhiteSpace($env:DISCORD_BOT_TOKEN)) { throw "Token empty." }
    $start = Get-Date -Format o
    Add-Content -Path $log -Value "[$start] START referee"
    & $node (Join-Path $dir "beef-referee.mjs") --run 2>&1 | Out-File -FilePath $log -Encoding utf8 -Append
    $code = $LASTEXITCODE
    Add-Content -Path $log -Value "[$(Get-Date -Format o)] EXIT code=$code, retrying after 30 seconds"
  } catch {
    Add-Content -Path $log -Value "[$(Get-Date -Format o)] ERROR: $($_.Exception.Message)"
  } finally {
    Remove-Item Env:DISCORD_BOT_TOKEN -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 30
}
