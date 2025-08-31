#!/usr/bin/env node

/**
 * 海报编辑器服务管理脚本 (Node.js版本)
 * 支持启动、停止、重启、状态查看等功能
 * 跨平台兼容 (Windows/macOS/Linux)
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');

// 配置变量
const CONFIG = {
    SERVICE_NAME: '海报编辑器',
    CLIENT_DIR: './client',
    PORT: 3000,
    PID_FILE: './poster-editor.pid',
    LOG_FILE: './poster-editor.log'
};

// 颜色输出
const COLORS = {
    RED: '\x1b[91m',
    GREEN: '\x1b[92m',
    YELLOW: '\x1b[93m',
    BLUE: '\x1b[94m',
    NC: '\x1b[0m'
};

/**
 * 打印带颜色和时间戳的消息
 * @param {string} color 颜色代码
 * @param {string} message 消息内容
 */
function printMessage(color, message) {
    const timestamp = new Date().toLocaleString('zh-CN');
    console.log(`${color}[${timestamp}] ${message}${COLORS.NC}`);
}

/**
 * 检查端口是否被占用
 * @param {number} port 端口号
 * @returns {Promise<boolean>} 端口是否被占用
 */
function checkPort(port) {
    return new Promise((resolve) => {
        const isWindows = os.platform() === 'win32';
        const command = isWindows 
            ? `netstat -ano | findstr ":${port} "`
            : `lsof -Pi :${port} -sTCP:LISTEN -t`;
            
        exec(command, (error, stdout) => {
            resolve(!error && stdout.trim().length > 0);
        });
    });
}

/**
 * 获取服务进程ID
 * @returns {Promise<number|null>} 进程ID或null
 */
function getServicePid() {
    return new Promise((resolve) => {
        if (!fs.existsSync(CONFIG.PID_FILE)) {
            resolve(null);
            return;
        }
        
        try {
            const pid = parseInt(fs.readFileSync(CONFIG.PID_FILE, 'utf8').trim());
            
            // 检查进程是否存在
            const isWindows = os.platform() === 'win32';
            const command = isWindows 
                ? `tasklist /fi "PID eq ${pid}" /fo csv | find "${pid}"`
                : `ps -p ${pid}`;
                
            exec(command, (error) => {
                if (error) {
                    // 进程不存在，清理PID文件
                    fs.unlinkSync(CONFIG.PID_FILE);
                    resolve(null);
                } else {
                    resolve(pid);
                }
            });
        } catch (err) {
            resolve(null);
        }
    });
}

/**
 * 检查服务状态
 * @returns {Promise<boolean>} 服务是否运行
 */
async function checkStatus() {
    const pid = await getServicePid();
    if (pid) {
        printMessage(COLORS.GREEN, `✅ ${CONFIG.SERVICE_NAME} 正在运行 (PID: ${pid}, Port: ${CONFIG.PORT})`);
        return true;
    } else {
        printMessage(COLORS.RED, `❌ ${CONFIG.SERVICE_NAME} 未运行`);
        return false;
    }
}

/**
 * 等待指定毫秒
 * @param {number} ms 毫秒数
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 启动服务
 * @returns {Promise<boolean>} 启动是否成功
 */
async function startService() {
    printMessage(COLORS.BLUE, `🚀 正在启动 ${CONFIG.SERVICE_NAME}...`);
    
    // 检查是否已经运行
    if (await checkStatus()) {
        printMessage(COLORS.YELLOW, `⚠️  ${CONFIG.SERVICE_NAME} 已经在运行了`);
        return false;
    }
    
    // 检查client目录是否存在
    if (!fs.existsSync(CONFIG.CLIENT_DIR)) {
        printMessage(COLORS.RED, `❌ 错误: 找不到 ${CONFIG.CLIENT_DIR} 目录`);
        return false;
    }
    
    // 检查package.json是否存在
    const packageJsonPath = path.join(CONFIG.CLIENT_DIR, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        printMessage(COLORS.RED, `❌ 错误: 找不到 ${packageJsonPath}`);
        return false;
    }
    
    // 检查端口是否被占用
    if (await checkPort(CONFIG.PORT)) {
        printMessage(COLORS.RED, `❌ 错误: 端口 ${CONFIG.PORT} 已被占用`);
        return false;
    }
    
    // 检查node_modules是否存在，如果不存在则安装依赖
    const nodeModulesPath = path.join(CONFIG.CLIENT_DIR, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        printMessage(COLORS.YELLOW, '📦 正在安装依赖...');
        
        const installPromise = new Promise((resolve) => {
            const npmInstall = spawn('npm', ['install'], {
                cwd: CONFIG.CLIENT_DIR,
                stdio: 'inherit'
            });
            
            npmInstall.on('close', (code) => {
                resolve(code === 0);
            });
        });
        
        const installSuccess = await installPromise;
        if (!installSuccess) {
            printMessage(COLORS.RED, '❌ 依赖安装失败');
            return false;
        }
        
        printMessage(COLORS.GREEN, '✅ 依赖安装完成');
    }
    
    // 启动服务
    printMessage(COLORS.BLUE, '🔄 正在启动 React 开发服务器...');
    
    // 打开日志文件描述符
    const logFd = fs.openSync(CONFIG.LOG_FILE, 'w');
    
    const npmStart = spawn('npm', ['start'], {
        cwd: CONFIG.CLIENT_DIR,
        detached: true,
        stdio: ['ignore', logFd, logFd]
    });
    
    // 记录PID
    fs.writeFileSync(CONFIG.PID_FILE, npmStart.pid.toString());
    
    // 处理子进程事件
    npmStart.on('error', (err) => {
        printMessage(COLORS.RED, `❌ 启动失败: ${err.message}`);
        fs.closeSync(logFd);
    });
    
    npmStart.on('exit', (code) => {
        if (fs.existsSync(CONFIG.PID_FILE)) {
            fs.unlinkSync(CONFIG.PID_FILE);
        }
    });
    
    // 分离进程，让它在后台运行
    npmStart.unref();
    
    // 关闭文件描述符（进程已经继承了）
    fs.closeSync(logFd);
    
    // 等待服务启动
    printMessage(COLORS.YELLOW, '⏳ 等待服务启动...');
    
    for (let attempts = 0; attempts < 30; attempts++) {
        if (await checkPort(CONFIG.PORT)) {
            printMessage(COLORS.GREEN, `✅ ${CONFIG.SERVICE_NAME} 启动成功!`);
            printMessage(COLORS.GREEN, `🌐 访问地址: http://localhost:${CONFIG.PORT}`);
            printMessage(COLORS.BLUE, `📝 日志文件: ${CONFIG.LOG_FILE}`);
            return true;
        }
        
        await sleep(2000);
        process.stdout.write('.');
    }
    
    console.log(); // 换行
    printMessage(COLORS.RED, `❌ 服务启动超时，请检查日志文件: ${CONFIG.LOG_FILE}`);
    await stopService();
    return false;
}

/**
 * 停止服务
 * @returns {Promise<boolean>} 停止是否成功
 */
async function stopService() {
    printMessage(COLORS.BLUE, `🛑 正在停止 ${CONFIG.SERVICE_NAME}...`);
    
    const pid = await getServicePid();
    if (!pid) {
        printMessage(COLORS.YELLOW, `⚠️  ${CONFIG.SERVICE_NAME} 未运行`);
        return false;
    }
    
    try {
        const isWindows = os.platform() === 'win32';
        
        // 尝试优雅关闭（包括子进程）
        if (isWindows) {
            // Windows下杀死进程树
            exec(`taskkill /pid ${pid} /t /f`, () => {});
        } else {
            // Unix下杀死进程组
            try {
                process.kill(-pid, 'SIGTERM');
            } catch (err) {
                // 如果进程组不存在，直接杀死主进程
                process.kill(pid, 'SIGTERM');
            }
        }
        
        // 等待进程结束
        for (let attempts = 0; attempts < 10; attempts++) {
            const stillRunning = await getServicePid();
            if (!stillRunning) {
                break;
            }
            await sleep(1000);
        }
        
        // 如果进程仍在运行，强制杀死
        const stillRunning = await getServicePid();
        if (stillRunning) {
            printMessage(COLORS.YELLOW, '⚡ 强制停止进程...');
            if (isWindows) {
                exec(`taskkill /pid ${pid} /f /t`, () => {});
            } else {
                try {
                    process.kill(-pid, 'SIGKILL');
                } catch (err) {
                    process.kill(pid, 'SIGKILL');
                }
            }
            
            // 额外等待确保进程完全终止
            await sleep(2000);
        }
        
        // 清理PID文件
        if (fs.existsSync(CONFIG.PID_FILE)) {
            fs.unlinkSync(CONFIG.PID_FILE);
        }
        
        printMessage(COLORS.GREEN, `✅ ${CONFIG.SERVICE_NAME} 已停止`);
        return true;
        
    } catch (err) {
        printMessage(COLORS.RED, `❌ 停止服务时出错: ${err.message}`);
        return false;
    }
}

/**
 * 重启服务
 * @returns {Promise<boolean>} 重启是否成功
 */
async function restartService() {
    printMessage(COLORS.BLUE, `🔄 正在重启 ${CONFIG.SERVICE_NAME}...`);
    await stopService();
    await sleep(2000);
    return await startService();
}

/**
 * 查看日志
 */
function showLogs() {
    if (!fs.existsSync(CONFIG.LOG_FILE)) {
        printMessage(COLORS.RED, `❌ 日志文件不存在: ${CONFIG.LOG_FILE}`);
        return;
    }
    
    printMessage(COLORS.BLUE, '📋 显示最近的日志 (按 Ctrl+C 退出):');
    console.log('----------------------------------------');
    
    const isWindows = os.platform() === 'win32';
    const command = isWindows 
        ? `powershell -command "Get-Content '${CONFIG.LOG_FILE}' -Wait"`
        : `tail -f ${CONFIG.LOG_FILE}`;
        
    const logProcess = exec(command, { stdio: 'inherit' });
    
    // 处理Ctrl+C
    process.on('SIGINT', () => {
        logProcess.kill();
        process.exit(0);
    });
}

/**
 * 清理日志
 */
function cleanLogs() {
    if (fs.existsSync(CONFIG.LOG_FILE)) {
        fs.writeFileSync(CONFIG.LOG_FILE, '');
        printMessage(COLORS.GREEN, '✅ 日志文件已清理');
    } else {
        printMessage(COLORS.YELLOW, '⚠️  日志文件不存在');
    }
}

/**
 * 显示帮助信息
 */
function showHelp() {
    console.log('');
    console.log(`🎨 ${CONFIG.SERVICE_NAME} 服务管理脚本`);
    console.log('');
    console.log('用法: node service.js [命令]');
    console.log('');
    console.log('可用命令:');
    console.log('  start     启动服务');
    console.log('  stop      停止服务');
    console.log('  restart   重启服务');
    console.log('  status    查看服务状态');
    console.log('  logs      查看实时日志');
    console.log('  clean     清理日志文件');
    console.log('  help      显示帮助信息');
    console.log('');
    console.log('示例:');
    console.log('  node service.js start      # 启动服务');
    console.log('  node service.js status     # 查看状态');
    console.log('  node service.js restart    # 重启服务');
    console.log('');
}

/**
 * 主函数
 */
async function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            await startService();
            break;
        case 'stop':
            await stopService();
            break;
        case 'restart':
            await restartService();
            break;
        case 'status':
            await checkStatus();
            break;
        case 'logs':
            showLogs();
            break;
        case 'clean':
            cleanLogs();
            break;
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
        case undefined:
            showHelp();
            break;
        default:
            printMessage(COLORS.RED, `❌ 未知命令: ${command}`);
            showHelp();
            process.exit(1);
    }
}

// 执行主函数
if (require.main === module) {
    main().catch(err => {
        printMessage(COLORS.RED, `❌ 执行错误: ${err.message}`);
        process.exit(1);
    });
} 