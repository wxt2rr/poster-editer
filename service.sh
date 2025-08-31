#!/bin/bash

# 海报编辑器服务管理脚本
# 支持启动、停止、重启、状态查看等功能

# 配置变量
SERVICE_NAME="海报编辑器"
CLIENT_DIR="./client"
PORT=3000
PID_FILE="./poster-editor.pid"
LOG_FILE="./poster-editor.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口未被占用
    fi
}

# 获取服务进程ID
get_service_pid() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            echo $pid
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# 检查服务状态
check_status() {
    local pid=$(get_service_pid)
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ ${SERVICE_NAME} 正在运行 (PID: $pid, Port: $PORT)"
        return 0
    else
        print_message $RED "❌ ${SERVICE_NAME} 未运行"
        return 1
    fi
}

# 启动服务
start_service() {
    print_message $BLUE "🚀 正在启动 ${SERVICE_NAME}..."
    
    # 检查是否已经运行
    if check_status > /dev/null 2>&1; then
        print_message $YELLOW "⚠️  ${SERVICE_NAME} 已经在运行了"
        return 1
    fi
    
    # 检查client目录是否存在
    if [ ! -d "$CLIENT_DIR" ]; then
        print_message $RED "❌ 错误: 找不到 client 目录"
        return 1
    fi
    
    # 检查package.json是否存在
    if [ ! -f "$CLIENT_DIR/package.json" ]; then
        print_message $RED "❌ 错误: 找不到 $CLIENT_DIR/package.json"
        return 1
    fi
    
    # 检查端口是否被占用
    if check_port $PORT; then
        print_message $RED "❌ 错误: 端口 $PORT 已被占用"
        return 1
    fi
    
    # 检查node_modules是否存在，如果不存在则安装依赖
    if [ ! -d "$CLIENT_DIR/node_modules" ]; then
        print_message $YELLOW "📦 正在安装依赖..."
        cd "$CLIENT_DIR"
        npm install
        if [ $? -ne 0 ]; then
            print_message $RED "❌ 依赖安装失败"
            cd ..
            return 1
        fi
        cd ..
        print_message $GREEN "✅ 依赖安装完成"
    fi
    
      # 启动服务
  print_message $BLUE "🔄 正在启动 React 开发服务器..."
  cd "$CLIENT_DIR"
  
  # 后台启动服务并记录PID
  nohup npm start > "../$LOG_FILE" 2>&1 &
  local pid=$!
  echo $pid > "../$PID_FILE"
  cd ..
  
  # 等待一下确保进程启动
  sleep 1
    
    # 等待服务启动
    print_message $YELLOW "⏳ 等待服务启动..."
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if check_port $PORT; then
            print_message $GREEN "✅ ${SERVICE_NAME} 启动成功!"
            print_message $GREEN "🌐 访问地址: http://localhost:$PORT"
            print_message $BLUE "📝 日志文件: $LOG_FILE"
            return 0
        fi
        sleep 2
        attempts=$((attempts + 1))
        echo -n "."
    done
    
    print_message $RED "❌ 服务启动超时，请检查日志文件: $LOG_FILE"
    stop_service
    return 1
}

# 停止服务
stop_service() {
    print_message $BLUE "🛑 正在停止 ${SERVICE_NAME}..."
    
    local pid=$(get_service_pid)
    if [ $? -eq 0 ]; then
        # 尝试优雅关闭
        kill $pid
        
        # 等待进程结束
        local attempts=0
        local max_attempts=10
        
        while [ $attempts -lt $max_attempts ]; do
            if ! ps -p $pid > /dev/null 2>&1; then
                break
            fi
            sleep 1
            attempts=$((attempts + 1))
        done
        
        # 如果进程仍在运行，强制杀死
        if ps -p $pid > /dev/null 2>&1; then
            print_message $YELLOW "⚡ 强制停止进程..."
            kill -9 $pid
        fi
        
        # 清理PID文件
        rm -f "$PID_FILE"
        
        print_message $GREEN "✅ ${SERVICE_NAME} 已停止"
        return 0
    else
        print_message $YELLOW "⚠️  ${SERVICE_NAME} 未运行"
        return 1
    fi
}

# 重启服务
restart_service() {
    print_message $BLUE "🔄 正在重启 ${SERVICE_NAME}..."
    stop_service
    sleep 2
    start_service
}

# 查看日志
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_message $BLUE "📋 显示最近的日志 (按 Ctrl+C 退出):"
        echo "----------------------------------------"
        tail -f "$LOG_FILE"
    else
        print_message $RED "❌ 日志文件不存在: $LOG_FILE"
    fi
}

# 清理日志
clean_logs() {
    if [ -f "$LOG_FILE" ]; then
        > "$LOG_FILE"
        print_message $GREEN "✅ 日志文件已清理"
    else
        print_message $YELLOW "⚠️  日志文件不存在"
    fi
}

# 显示帮助信息
show_help() {
    echo ""
    echo "🎨 ${SERVICE_NAME} 服务管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  start     启动服务"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  status    查看服务状态"
    echo "  logs      查看实时日志"
    echo "  clean     清理日志文件"
    echo "  help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start      # 启动服务"
    echo "  $0 status     # 查看状态"
    echo "  $0 restart    # 重启服务"
    echo ""
}

# 主函数
main() {
    case "$1" in
        "start")
            start_service
            ;;
        "stop")
            stop_service
            ;;
        "restart")
            restart_service
            ;;
        "status")
            check_status
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            clean_logs
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            print_message $RED "❌ 未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@" 