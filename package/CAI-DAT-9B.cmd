@echo off
setlocal
title Cai he thong Content cho 9B
set "FREEUP_GIFT_PACKAGE=%~dp0"
echo Cai he thong Content vao 9BizClaw v3 tren may nay.
echo Hay mo 9B, hoan tat khoi tao va ket thuc cac luot chat dang chay.
echo Bo cai se cho 9B ranh, sau do cai va xac minh cac skill.
echo.
if not exist "%FREEUP_GIFT_PACKAGE%install-job.cjs" goto incomplete_package
if not exist "%FREEUP_GIFT_PACKAGE%bootstrap.cjs" goto incomplete_package
if not exist "%FREEUP_GIFT_PACKAGE%distribution-manifest.json" goto incomplete_package
if not exist "%FREEUP_GIFT_PACKAGE%package-checksums.json" goto incomplete_package
powershell.exe -NoProfile -Command "$ErrorActionPreference='Stop'; try { $r=$env:NINEBIZ_INSTALL_ROOT; if(-not $r){$r=$env:NINEBIZ_CLI_ROOT}; if(-not $r -and $env:OPENCLAW_STATE_DIR){$c=Split-Path -Parent $env:OPENCLAW_STATE_DIR; if(Test-Path -LiteralPath (Join-Path $c 'vendor\node\node.exe')){$r=$c}}; if(-not $r -and $env:APPDATA){$m=Join-Path $env:APPDATA '9BizClaw-v3\install-root.json'; if(Test-Path -LiteralPath $m){$r=(Get-Content -LiteralPath $m -Raw -Encoding UTF8 | ConvertFrom-Json).path}}; if(-not $r){throw 'Khong tim thay 9BizClaw v3. Mo va khoi tao 9B truoc.'}; $n=Join-Path $r 'vendor\node\node.exe'; if(-not (Test-Path -LiteralPath $n)){throw 'Khong tim thay Node di kem 9B.'}; $j=Join-Path $env:FREEUP_GIFT_PACKAGE 'install-job.cjs'; $a=@($j,'run','--install-root',$r,'--select-agent','--install-deps'); $u=Read-Host 'Nang cap bo content da cai? Nhap CO neu dong y; Enter neu cai moi'; if($u -eq 'CO'){$a+='--upgrade'}; & $n @a; exit $LASTEXITCODE } catch { Write-Host ('CHUA CAI XONG: '+$_.Exception.Message); exit 1 }"
set "FREEUP_INSTALL_EXIT=%ERRORLEVEL%"
echo.
if not "%FREEUP_INSTALL_EXIT%"=="0" (echo Chua cai hoan tat. Doc loi va tep bao cao o tren.) else (echo Da cai va xac minh. Mo luot chat moi trong 9B va dung /caidat.)
pause
exit /b %FREEUP_INSTALL_EXIT%

:incomplete_package
echo CHUA CAI XONG: Chua giai nen day du bo cai ZIP.
echo Khong mo CAI-DAT-9B.cmd truc tiep trong cua so xem file ZIP.
echo Hay nhap phai file ZIP, chon "Extract All / Giai nen tat ca".
echo Mo THU MUC moi duoc giai nen, sau do mo CAI-DAT-9B.cmd o trong do.
echo Neu van bao loi, tai lai ZIP dung phien ban tu trang GitHub cua bo content.
pause
exit /b 1
