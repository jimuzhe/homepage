#!/bin/bash

# 个人主页项目 Linux 服务器部署脚本
# 作者: LongDz
# 用途: 自动化部署个人主页到 Linux 服务器

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="homepage"
PROJECT_DIR="/var/www/$PROJECT_NAME"
BACKEND_PORT=5000
FRONTEND_PORT=80
DOMAIN="your-domain.com"  # 请修改为您的域名
EMAIL="your-email@example.com"  # 请修改为您的邮箱

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        log_info "请使用: sudo $0"
        exit 1
    fi
}

# 检测系统类型
detect_system() {
    if [[ -f /etc/redhat-release ]]; then
        SYSTEM="centos"
        PKG_MANAGER="yum"
    elif [[ -f /etc/debian_version ]]; then
        SYSTEM="ubuntu"
        PKG_MANAGER="apt"
    else
        log_error "不支持的系统类型"
        exit 1
    fi
    log_info "检测到系统类型: $SYSTEM"
}

# 更新系统
update_system() {
    log_step "更新系统包..."
    if [[ $SYSTEM == "ubuntu" ]]; then
        apt update && apt upgrade -y
    elif [[ $SYSTEM == "centos" ]]; then
        yum update -y
    fi
}

# 安装基础依赖
install_dependencies() {
    log_step "安装基础依赖..."
    
    if [[ $SYSTEM == "ubuntu" ]]; then
        apt install -y python3 python3-pip python3-venv nginx git curl wget unzip
    elif [[ $SYSTEM == "centos" ]]; then
        yum install -y python3 python3-pip nginx git curl wget unzip
        yum groupinstall -y "Development Tools"
    fi
    
    # 安装 Node.js (用于前端构建，可选)
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    if [[ $SYSTEM == "ubuntu" ]]; then
        apt install -y nodejs
    elif [[ $SYSTEM == "centos" ]]; then
        yum install -y nodejs npm
    fi
}

# 创建项目目录
create_directories() {
    log_step "创建项目目录..."
    mkdir -p $PROJECT_DIR
    mkdir -p $PROJECT_DIR/backend
    mkdir -p $PROJECT_DIR/frontend
    mkdir -p $PROJECT_DIR/logs
    mkdir -p /etc/systemd/system
}

# 部署后端
deploy_backend() {
    log_step "部署Python后端..."
    
    # 复制后端文件
    cp -r ./backend/* $PROJECT_DIR/backend/
    
    # 创建虚拟环境
    cd $PROJECT_DIR/backend
    python3 -m venv venv
    source venv/bin/activate
    
    # 安装依赖
    pip install -r requirements.txt
    pip install gunicorn  # 生产环境WSGI服务器
    
    # 设置权限
    chown -R www-data:www-data $PROJECT_DIR
    chmod +x $PROJECT_DIR/backend/app.py
}

# 部署前端
deploy_frontend() {
    log_step "部署前端文件..."
    
    # 复制前端文件
    cp -r ./frontend/* $PROJECT_DIR/frontend/
    
    # 设置权限
    chown -R www-data:www-data $PROJECT_DIR/frontend
}

# 配置systemd服务
configure_systemd() {
    log_step "配置systemd服务..."
    
    cat > /etc/systemd/system/homepage-backend.service << EOF
[Unit]
Description=Homepage Backend Service
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_DIR/backend
Environment=PATH=$PROJECT_DIR/backend/venv/bin
ExecStart=$PROJECT_DIR/backend/venv/bin/gunicorn --bind 127.0.0.1:$BACKEND_PORT --workers 3 app:app
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    # 重新加载systemd并启动服务
    systemctl daemon-reload
    systemctl enable homepage-backend
    systemctl start homepage-backend
    
    log_info "后端服务状态:"
    systemctl status homepage-backend --no-pager
}

# 配置Nginx
configure_nginx() {
    log_step "配置Nginx..."
    
    # 备份原配置
    if [[ -f /etc/nginx/sites-available/default ]]; then
        cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    fi
    
    cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # 前端静态文件
    location / {
        root $PROJECT_DIR/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # 后端API代理
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # 日志
    access_log $PROJECT_DIR/logs/nginx_access.log;
    error_log $PROJECT_DIR/logs/nginx_error.log;
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    
    # 删除默认站点（如果存在）
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    nginx -t
    
    # 重启Nginx
    systemctl restart nginx
    systemctl enable nginx
}

# 配置防火墙
configure_firewall() {
    log_step "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu UFW
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
    fi
}

# 安装SSL证书 (Let's Encrypt)
install_ssl() {
    log_step "安装SSL证书..."
    
    if [[ $SYSTEM == "ubuntu" ]]; then
        apt install -y certbot python3-certbot-nginx
    elif [[ $SYSTEM == "centos" ]]; then
        yum install -y certbot python3-certbot-nginx
    fi
    
    # 获取证书
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # 设置自动续期
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
}

# 主函数
main() {
    log_info "开始部署个人主页项目..."
    
    check_root
    detect_system
    update_system
    install_dependencies
    create_directories
    deploy_backend
    deploy_frontend
    configure_systemd
    configure_nginx
    configure_firewall
    
    log_info "基础部署完成！"
    log_warn "请修改脚本中的域名和邮箱配置"
    log_info "如需SSL证书，请运行: sudo $0 ssl"
    
    log_info "服务状态检查:"
    systemctl status homepage-backend --no-pager
    systemctl status nginx --no-pager
    
    log_info "部署完成！访问地址: http://$DOMAIN"
}

# 处理命令行参数
case "${1:-}" in
    "ssl")
        install_ssl
        ;;
    *)
        main
        ;;
esac
