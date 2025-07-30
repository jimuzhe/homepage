#!/bin/bash

# 个人主页一键部署脚本 - Linux服务器版
# 作者: LongDz
# 版本: 1.0

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="homepage"
PORT=3001
DOMAIN=""  # 可选：您的域名
SSL_EMAIL=""  # 可选：SSL证书邮箱

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "检测到root用户，建议使用普通用户运行此脚本"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 检测操作系统
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "无法检测操作系统"
        exit 1
    fi
    print_message "检测到操作系统: $OS $VER"
}

# 安装依赖
install_dependencies() {
    print_step "安装系统依赖..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        sudo apt update
        sudo apt install -y curl wget git nginx
        
        # 安装Node.js
        if ! command -v node &> /dev/null; then
            print_step "安装Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]]; then
        sudo yum update -y
        sudo yum install -y curl wget git nginx
        
        # 安装Node.js
        if ! command -v node &> /dev/null; then
            print_step "安装Node.js..."
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
        fi
        
    else
        print_error "不支持的操作系统: $OS"
        exit 1
    fi
    
    print_message "Node.js版本: $(node --version)"
    print_message "npm版本: $(npm --version)"
}

# 创建项目目录
setup_project() {
    print_step "设置项目目录..."
    
    PROJECT_DIR="/var/www/$PROJECT_NAME"
    
    # 创建项目目录
    sudo mkdir -p $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR
    
    # 复制项目文件
    print_step "复制项目文件..."
    cp -r ./* $PROJECT_DIR/
    cd $PROJECT_DIR
    
    # 安装npm依赖
    print_step "安装npm依赖..."
    npm install
    
    print_message "项目目录: $PROJECT_DIR"
}

# 配置systemd服务
setup_systemd() {
    print_step "配置systemd服务..."
    
    sudo tee /etc/systemd/system/$PROJECT_NAME.service > /dev/null <<EOF
[Unit]
Description=Personal Homepage Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
EOF

    # 重新加载systemd并启动服务
    sudo systemctl daemon-reload
    sudo systemctl enable $PROJECT_NAME
    sudo systemctl start $PROJECT_NAME
    
    print_message "服务已启动并设置为开机自启"
}

# 配置Nginx反向代理
setup_nginx() {
    print_step "配置Nginx反向代理..."
    
    # 备份默认配置
    if [[ -f /etc/nginx/sites-available/default ]]; then
        sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    fi
    
    # 创建Nginx配置
    sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN:-_};
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:$PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    
    # 删除默认站点（如果存在）
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试Nginx配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_message "Nginx配置完成"
}

# 配置防火墙
setup_firewall() {
    print_step "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian UFW
        sudo ufw allow 22/tcp
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw --force enable
        print_message "UFW防火墙已配置"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL firewalld
        sudo firewall-cmd --permanent --add-service=ssh
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload
        print_message "firewalld防火墙已配置"
    else
        print_warning "未检测到防火墙，请手动开放80和443端口"
    fi
}

# 配置SSL证书（可选）
setup_ssl() {
    if [[ -n "$DOMAIN" ]] && [[ -n "$SSL_EMAIL" ]]; then
        print_step "配置SSL证书..."
        
        # 安装certbot
        if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
            sudo apt install -y certbot python3-certbot-nginx
        elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
            sudo yum install -y certbot python3-certbot-nginx
        fi
        
        # 获取SSL证书
        sudo certbot --nginx -d $DOMAIN --email $SSL_EMAIL --agree-tos --non-interactive
        
        # 设置自动续期
        echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
        
        print_message "SSL证书配置完成"
    else
        print_warning "跳过SSL配置（需要域名和邮箱）"
    fi
}

# 检查服务状态
check_status() {
    print_step "检查服务状态..."
    
    # 检查Node.js服务
    if sudo systemctl is-active --quiet $PROJECT_NAME; then
        print_message "✅ Node.js服务运行正常"
    else
        print_error "❌ Node.js服务未运行"
        sudo systemctl status $PROJECT_NAME
    fi
    
    # 检查Nginx服务
    if sudo systemctl is-active --quiet nginx; then
        print_message "✅ Nginx服务运行正常"
    else
        print_error "❌ Nginx服务未运行"
        sudo systemctl status nginx
    fi
    
    # 检查端口
    if netstat -tlnp | grep :80 > /dev/null; then
        print_message "✅ 端口80已开放"
    else
        print_warning "⚠️ 端口80未开放"
    fi
}

# 显示部署信息
show_info() {
    print_step "部署完成！"
    echo
    echo "==================== 部署信息 ===================="
    echo "项目目录: $PROJECT_DIR"
    echo "服务名称: $PROJECT_NAME"
    echo "运行端口: $PORT"
    echo "访问地址: http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"
    if [[ -n "$DOMAIN" ]]; then
        echo "域名访问: http://$DOMAIN"
        if [[ -n "$SSL_EMAIL" ]]; then
            echo "HTTPS访问: https://$DOMAIN"
        fi
    fi
    echo
    echo "==================== 常用命令 ===================="
    echo "查看服务状态: sudo systemctl status $PROJECT_NAME"
    echo "重启服务:     sudo systemctl restart $PROJECT_NAME"
    echo "查看日志:     sudo journalctl -u $PROJECT_NAME -f"
    echo "重启Nginx:    sudo systemctl restart nginx"
    echo "查看Nginx日志: sudo tail -f /var/log/nginx/access.log"
    echo
    echo "==================== 管理后台 ===================="
    echo "管理地址: http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')/admin"
    echo "登录密码: LongDz"
    echo "=================================================="
}

# 主函数
main() {
    echo "🚀 个人主页一键部署脚本"
    echo "=========================="
    
    # 检查参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --email)
                SSL_EMAIL="$2"
                shift 2
                ;;
            --port)
                PORT="$2"
                shift 2
                ;;
            -h|--help)
                echo "用法: $0 [选项]"
                echo "选项:"
                echo "  --domain DOMAIN    设置域名（可选）"
                echo "  --email EMAIL      设置SSL证书邮箱（可选）"
                echo "  --port PORT        设置端口（默认3001）"
                echo "  -h, --help         显示帮助信息"
                exit 0
                ;;
            *)
                print_error "未知参数: $1"
                exit 1
                ;;
        esac
    done
    
    check_root
    detect_os
    install_dependencies
    setup_project
    setup_systemd
    setup_nginx
    setup_firewall
    setup_ssl
    check_status
    show_info
    
    print_message "🎉 部署完成！请访问您的网站查看效果。"
}

# 运行主函数
main "$@"
