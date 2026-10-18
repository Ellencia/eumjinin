# 서버의 SQLite 백업(/srv/kband/backups, 매일 04:20 생성)을 PC로 당겨온다. VM이 죽어도 사본이 남게.
# 보관처 %USERPROFILE%\Backups\kband, 30일 지난 사본 삭제(서버 보관 주기·개인정보처리방침과 동일).
# 한 번만:  powershell -File deploy\pull_backup.ps1 -Register   → 작업 스케줄러 "kband-backup-pull" 매일 05:00, 놓치면 다음 기회에 실행
param([switch]$Register)
$Dest = "$env:USERPROFILE\Backups\kband"
$Remote = 'root@158.247.204.136:/srv/kband/backups/*.db'

if ($Register) {
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
  $trigger = New-ScheduledTaskTrigger -Daily -At 5:00
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
  Register-ScheduledTask -TaskName 'kband-backup-pull' -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
  Write-Output 'registered: kband-backup-pull'
  return
}

New-Item -ItemType Directory -Force $Dest | Out-Null
scp -q -p -o BatchMode=yes $Remote $Dest   # -p: 서버 mtime 유지 → 30일 삭제 기준이 생성일
$code = $LASTEXITCODE
Get-ChildItem $Dest -Filter 'kband-*.db' | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force
"$(Get-Date -Format s) scp exit $code, $((Get-ChildItem $Dest -Filter 'kband-*.db').Count) files" | Add-Content "$Dest\pull.log"
exit $code
