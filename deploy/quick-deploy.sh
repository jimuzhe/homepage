#!/bin/bash

# 个人主页一键部署脚本
# 支持 Docker 和传统部署两种方式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# 显示欢迎信息
show_welcome() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "       个人主页项目一键部署脚本"
    echo "=================================================="
    echo -e "${NC}"
    echo "支持的部署方式："
    echo "1. Docker 部署（推荐）"
    echo "2. 传统部署（Nginx + Systemd）"
    echo ""
}

# 检查系统要求
check_requirements() {
    log_step "检查系统要求..."
    
    # 检查操作系统
    if [[ ! -f /etc/os-release ]]; then
        log_error "不支持的操作系统"
        exit 1
    fi
    
    # 检查权限
    if [[ $EUID -ne 0 ]]; then
        log_error "需要 root 权限运行此脚本"
        log_info "请使用: sudo $0"
        exit 1
    fi
    
    log_info "系统检查通过"
}

# 选择部署方式
choose_deployment_method() {
    echo ""
    echo "请选择部署方式："
    echo "1) Docker 部署（推荐，简单快速）"
    echo "2) 传统部署（完全控制，适合生产环境）"
    echo ""
    
    while true; do
        read -p "请输入选择 (1 或 2): " choice
        case $choice in
            1)
                DEPLOYMENT_METHOD="docker"
                break
                ;;
            2)
                DEPLOYMENT_METHOD="traditional"
                break
                ;;
            *)
                echo "请输入 1 或 2"
                ;;
        esac
    done
    
    log_info "选择的部署方式: $DEPLOYMENT_METHOD"
}

# 获取配置信息
get_configuration() {
    echo ""
    log_step "配置部署参数..."
    
    # 域名配置
    read -p "请输入您的域名 (例: example.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        DOMAIN="localhost"
        log_warn "未输入域名，使用默认值: localhost"
    fi
    
    # 邮箱配置（用于SSL证书）
    read -p "请输入您的邮箱 (用于SSL证书): " EMAIL
    if [[ -z "$EMAIL" ]]; then
        EMAIL="admin@$DOMAIN"
        log_warn "未输入邮箱，使用默认值: $EMAIL"
    fi
    
    # SSL证书选择
    if [[ "$DOMAIN" != "localhost" ]]; then
        read -p "是否安装 SSL 证书? (y/n): " INSTALL_SSL
        INSTALL_SSL=${INSTALL_SSL:-n}
    else
        INSTALL_SSL="n"
    fi
    
    echo ""
    log_info "配置信息："
    log_info "域名: $DOMAIN"
    log_info "邮箱: $EMAIL"
    log_info "SSL证书: $INSTALL_SSL"
    echo ""
}

# Docker 部署
deploy_with_docker() {
    log_step "开始 Docker 部署..."
    
    # 安装 Docker
    if ! command -v docker &> /dev/null; then
        log_step "安装 Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl start docker
        systemctl enable docker
    fi
    
    # 安装 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_step "安装 Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # 创建部署目录
    mkdir -p /opt/homepage/{data,logs,ssl}
    cd /opt/homepage
    
    # 复制项目文件
    cp -r /tmp/homepage/* .
    
    # 复制配置文件
    cp frontend/public/config.json data/
    
    # 修改 docker-compose.yml 中的端口配置
    if [[ "$DOMAIN" != "localhost" ]]; then
        sed -i "s/server_name _;/server_name $DOMAIN www.$DOMAIN;/" deploy/nginx.conf
    fi
    
    # 启动服务
    log_step "启动 Docker 服务..."
    cd deploy
    docker-compose up -d
    
    # 等待服务启动
    sleep 10
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_info "Docker 部署成功！"
        log_info "访问地址: http://$DOMAIN"
    else
        log_error "Docker 部署失败，请检查日志"
        docker-compose logs
        exit 1
    fi
}

# 传统部署
deploy_traditional() {
    log_step "开始传统部署..."
    
    # 修改部署脚本配置
    sed -i "s/DOMAIN=\"your-domain.com\"/DOMAIN=\"$DOMAIN\"/" deploy.sh
    sed -i "s/EMAIL=\"your-email@example.com\"/EMAIL=\"$EMAIL\"/" deploy.sh
    
    # 执行部署脚本
    chmod +x deploy.sh
    ./deploy.sh
    
    # 安装 SSL 证书
    if [[ "$INSTALL_SSL" == "y" || "$INSTALL_SSL" == "Y" ]]; then
        log_step "安装 SSL 证书..."
        ./deploy.sh ssl
    fi
}

# 安装后检查
post_deployment_check() {
    log_step "部署后检查..."
    
    # 检查端口
    if netstat -tlnp | grep -q ":80 "; then
        log_info "✅ HTTP 服务正常运行"
    else
        log_warn "⚠️  HTTP 服务可能未正常启动"
    fi
    
    if netstat -tlnp | grep -q ":443 "; then
        log_info "✅ HTTPS 服务正常运行"
    fi
    
    # 测试网站访问
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
        log_info "✅ 网站可以正常访问"
    else
        log_warn "⚠️  网站访问可能有问题"
    fi
}

# 显示部署结果
show_deployment_result() {
    echo ""
    echo -e "${GREEN}=================================================="
    echo "              部署完成！"
    echo -e "==================================================${NC}"
    echo ""
    echo "🌐 访问地址:"
    echo "   HTTP:  http://$DOMAIN"
    if [[ "$INSTALL_SSL" == "y" || "$INSTALL_SSL" == "Y" ]]; then
        echo "   HTTPS: https://$DOMAIN"
    fi
    echo ""
    echo "🔧 管理地址:"
    echo "   管理后台: http://$DOMAIN/admin.html"
    echo ""
    echo "📁 重要目录:"
    if [[ "$DEPLOYMENT_METHOD" == "docker" ]]; then
        echo "   项目目录: /opt/homepage"
        echo "   配置文件: /opt/homepage/data/config.json"
        echo "   日志目录: /opt/homepage/logs"
    else
        echo "   项目目录: /var/www/homepage"
        echo "   配置文件: /var/www/homepage/frontend/public/config.json"
        echo "   日志目录: /var/www/homepage/logs"
    fi
    echo ""
    echo "🔍 常用命令:"
    if [[ "$DEPLOYMENT_METHOD" == "docker" ]]; then
        echo "   查看状态: cd /opt/homepage/deploy && docker-compose ps"
        echo "   查看日志: cd /opt/homepage/deploy && docker-compose logs -f"
        echo "   重启服务: cd /opt/homepage/deploy && docker-compose restart"
        echo "   停止服务: cd /opt/homepage/deploy && docker-compose down"
    else
        echo "   查看后端: sudo systemctl status homepage-backend"
        echo "   查看前端: sudo systemctl status nginx"
        echo "   重启后端: sudo systemctl restart homepage-backend"
        echo "   重启前端: sudo systemctl restart nginx"
    fi
    echo ""
    log_info "部署完成！请访问您的网站进行测试。"
}

# 主函数
main() {
    show_welcome
    check_requirements
    choose_deployment_method
    get_configuration
    
    case $DEPLOYMENT_METHOD in
        "docker")
            deploy_with_docker
            ;;
        "traditional")
            deploy_traditional
            ;;
    esac
    
    post_deployment_check
    show_deployment_result
}

# 执行主函数
main "$@"
