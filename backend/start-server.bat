@echo off
REM 将当前目录切换到脚本所在目录
pushd "%~dp0"
REM 在新窗口里启动 server.js
start "" node server.js
REM 恢复之前的工作目录
popd
