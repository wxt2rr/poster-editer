@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 海报编辑器服务管理脚本 (Windows版本)
REM 支持启动、停止、重启、状态查看等功能

REM 配置变量
set SERVICE_NAME=海报编辑器
set CLIENT_DIR=client
set PORT=3000
set PID_FILE=poster-editor.pid
set LOG_FILE=poster-editor.log

REM 颜色代码 (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 打印带颜色和时间戳的消息
:print_message
set color=%1
set message=%2
for /f "tokens=1-4 delims=/: " %%a in ("%date% %time%") do set datetime=%%c-%%a-%%b %%d
echo %color%[%datetime%] %message%%NC%
goto :eof

REM 检查端口是否被占用
:check_port
set port=%1
for /f "tokens=2" %%a in ('netstat -ano ^| findstr ":%port% "') do (
    if "%%a" neq "" (
        exit /b 0
    )
)
exit /b 1

REM 获取服务进程ID
:get_service_pid
if exist "%PID_FILE%" (
    set /p pid=<"%PID_FILE%"
    tasklist /fi "PID eq !pid!" 2>nul | find "!pid!" >nul
    if !errorlevel! equ 0 (
        echo !pid!
        exit /b 0
    ) else (
        del /f /q "%PID_FILE%" 2>nul
        exit /b 1
    )
)
exit /b 1

REM 检查服务状态
:check_status
call :get_service_pid
set pid_result=!errorlevel!
if !pid_result! equ 0 (
    for /f %%i in ('call :get_service_pid') do set current_pid=%%i
    call :print_message "%GREEN%" "✅ %SERVICE_NAME% 正在运行 (PID: !current_pid!, Port: %PORT%)"
    exit /b 0
) else (
    call :print_message "%RED%" "❌ %SERVICE_NAME% 未运行"
    exit /b 1
)

REM 启动服务
:start_service
call :print_message "%BLUE%" "🚀 正在启动 %SERVICE_NAME%..."

REM 检查是否已经运行
call :check_status >nul 2>&1
if !errorlevel! equ 0 (
    call :print_message "%YELLOW%" "⚠️  %SERVICE_NAME% 已经在运行了"
    exit /b 1
)

REM 检查client目录是否存在
if not exist "%CLIENT_DIR%" (
    call :print_message "%RED%" "❌ 错误: 找不到 %CLIENT_DIR% 目录"
    exit /b 1
)

REM 检查package.json是否存在
if not exist "%CLIENT_DIR%\package.json" (
    call :print_message "%RED%" "❌ 错误: 找不到 %CLIENT_DIR%\package.json"
    exit /b 1
)

REM 检查端口是否被占用
call :check_port %PORT%
if !errorlevel! equ 0 (
    call :print_message "%RED%" "❌ 错误: 端口 %PORT% 已被占用"
    exit /b 1
)

REM 检查node_modules是否存在，如果不存在则安装依赖
if not exist "%CLIENT_DIR%\node_modules" (
    call :print_message "%YELLOW%" "📦 正在安装依赖..."
    cd /d "%CLIENT_DIR%"
    call npm install
    if !errorlevel! neq 0 (
        call :print_message "%RED%" "❌ 依赖安装失败"
        cd /d ".."
        exit /b 1
    )
    cd /d ".."
    call :print_message "%GREEN%" "✅ 依赖安装完成"
)

REM 启动服务
call :print_message "%BLUE%" "🔄 正在启动 React 开发服务器..."
cd /d "%CLIENT_DIR%"

REM 后台启动服务并记录PID
start /b cmd /c "npm start > ..\%LOG_FILE% 2>&1"

REM 获取npm start进程的PID (Windows的限制，这里使用一个替代方案)
timeout /t 3 /nobreak >nul
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo csv ^| find "npm"') do (
    set service_pid=%%a
    set service_pid=!service_pid:"=!
    echo !service_pid! > "..\%PID_FILE%"
    goto :continue_start
)

:continue_start
cd /d ".."

REM 等待服务启动
call :print_message "%YELLOW%" "⏳ 等待服务启动..."
set attempts=0
set max_attempts=30

:wait_loop
call :check_port %PORT%
if !errorlevel! equ 0 (
    call :print_message "%GREEN%" "✅ %SERVICE_NAME% 启动成功!"
    call :print_message "%GREEN%" "🌐 访问地址: http://localhost:%PORT%"
    call :print_message "%BLUE%" "📝 日志文件: %LOG_FILE%"
    exit /b 0
)

set /a attempts+=1
if !attempts! lss !max_attempts! (
    timeout /t 2 /nobreak >nul
    echo|set /p =.
    goto :wait_loop
)

call :print_message "%RED%" "❌ 服务启动超时，请检查日志文件: %LOG_FILE%"
call :stop_service
exit /b 1

REM 停止服务
:stop_service
call :print_message "%BLUE%" "🛑 正在停止 %SERVICE_NAME%..."

call :get_service_pid
set pid_result=!errorlevel!
if !pid_result! equ 0 (
    for /f %%i in ('call :get_service_pid') do set current_pid=%%i
    
    REM 尝试优雅关闭
    taskkill /pid !current_pid! /t >nul 2>&1
    
    REM 等待进程结束
    set attempts=0
    set max_attempts=10
    
    :stop_wait_loop
    tasklist /fi "PID eq !current_pid!" 2>nul | find "!current_pid!" >nul
    if !errorlevel! neq 0 goto :stop_success
    
    set /a attempts+=1
    if !attempts! lss !max_attempts! (
        timeout /t 1 /nobreak >nul
        goto :stop_wait_loop
    )
    
    REM 如果进程仍在运行，强制杀死
    call :print_message "%YELLOW%" "⚡ 强制停止进程..."
    taskkill /pid !current_pid! /f /t >nul 2>&1
    
    :stop_success
    REM 清理PID文件
    del /f /q "%PID_FILE%" 2>nul
    
    call :print_message "%GREEN%" "✅ %SERVICE_NAME% 已停止"
    exit /b 0
) else (
    call :print_message "%YELLOW%" "⚠️  %SERVICE_NAME% 未运行"
    exit /b 1
)

REM 重启服务
:restart_service
call :print_message "%BLUE%" "🔄 正在重启 %SERVICE_NAME%..."
call :stop_service
timeout /t 2 /nobreak >nul
call :start_service
goto :eof

REM 查看日志
:show_logs
if exist "%LOG_FILE%" (
    call :print_message "%BLUE%" "📋 显示最近的日志 (按 Ctrl+C 退出):"
    echo ----------------------------------------
    powershell -command "Get-Content '%LOG_FILE%' -Wait"
) else (
    call :print_message "%RED%" "❌ 日志文件不存在: %LOG_FILE%"
)
goto :eof

REM 清理日志
:clean_logs
if exist "%LOG_FILE%" (
    echo. > "%LOG_FILE%"
    call :print_message "%GREEN%" "✅ 日志文件已清理"
) else (
    call :print_message "%YELLOW%" "⚠️  日志文件不存在"
)
goto :eof

REM 显示帮助信息
:show_help
echo.
echo 🎨 %SERVICE_NAME% 服务管理脚本
echo.
echo 用法: %~nx0 [命令]
echo.
echo 可用命令:
echo   start     启动服务
echo   stop      停止服务
echo   restart   重启服务
echo   status    查看服务状态
echo   logs      查看实时日志
echo   clean     清理日志文件
echo   help      显示帮助信息
echo.
echo 示例:
echo   %~nx0 start      # 启动服务
echo   %~nx0 status     # 查看状态
echo   %~nx0 restart    # 重启服务
echo.
goto :eof

REM 主函数
:main
if "%1"=="start" (
    call :start_service
) else if "%1"=="stop" (
    call :stop_service
) else if "%1"=="restart" (
    call :restart_service
) else if "%1"=="status" (
    call :check_status
) else if "%1"=="logs" (
    call :show_logs
) else if "%1"=="clean" (
    call :clean_logs
) else if "%1"=="help" (
    call :show_help
) else if "%1"=="--help" (
    call :show_help
) else if "%1"=="-h" (
    call :show_help
) else if "%1"=="" (
    call :show_help
) else (
    call :print_message "%RED%" "❌ 未知命令: %1"
    call :show_help
    exit /b 1
)
goto :eof

REM 执行主函数
call :main %* 