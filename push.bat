@echo off
title Quick Push

cd /d "D:\Project\PhuongThao"

echo ====================================
echo PUSH TOI GITHUB
echo ====================================

git add .
git commit -m "Update"
git push

rem Kiểm tra nếu mã lỗi (errorlevel) khác 0
if %errorlevel% neq 0 (
    echo.
    echo ====================================
    echo [LOI] Git Pull that bai! 
    echo Vui long kiem tra loi ben tren.
    echo ====================================
    pause
    exit /b
)

echo.
echo Hoan thanh thanh cong. Cua so se tu dong dong sau 5 giay...
timeout /t 5