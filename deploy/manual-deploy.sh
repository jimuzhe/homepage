#!/bin/bash

# 个人主页项目混合部署脚本
# 前端手动部署 + 后端Docker部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
PROJECT_DIR="/opt/homepage"
WEB_DIR="/var/www/homepage"
DOMAIN="localhost"
ADMIN_PASSWORD="LongDz6299"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        exit 1
    fi
}

# 获取配置
get_config() {
    echo ""
    log_info "配置部署参数..."
    
    read -p "请输入域名 (默认: localhost): " input_domain
    DOMAIN=${input_domain:-$DOMAIN}
    
    read -p "请输入管理员密码 (默认: LongDz6299): " input_password
    ADMIN_PASSWORD=${input_password:-$ADMIN_PASSWORD}
    
    echo ""
    log_info "配置信息："
    log_info "域名: $DOMAIN"
    log_info "项目用户: $PROJECT_USER"
    log_info "项目目录: $PROJECT_DIR"
    log_info "Web目录: $WEB_DIR"
    echo ""
}

# 安装系统依赖
install_dependencies() {
    log_info "安装系统依赖..."

    # 更新系统
    apt update

    # 安装必要软件
    apt install -y nginx git curl

    # 安装Docker
    install_docker

    log_success "系统依赖安装完成"
}

# 安装Docker
install_docker() {
    log_info "安装Docker..."

    if ! command -v docker &> /dev/null; then
        # 安装Docker
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh

        # 安装Docker Compose
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose

        # 启动Docker服务
        systemctl enable docker
        systemctl start docker

        log_success "Docker安装完成"
    else
        log_warn "Docker已安装"
    fi
}

# 部署项目文件
deploy_files() {
    log_info "部署项目文件..."

    # 创建项目目录
    mkdir -p $PROJECT_DIR

    # 复制项目文件
    cp -r ../* $PROJECT_DIR/

    # 创建必要目录
    mkdir -p $PROJECT_DIR/deploy/data
    mkdir -p $PROJECT_DIR/deploy/logs

    # 设置权限
    chmod -R 755 $PROJECT_DIR

    log_success "项目文件部署完成"
}

# 配置Docker后端
setup_docker_backend() {
    log_info "配置Docker后端..."

    cd $PROJECT_DIR/deploy

    # 创建环境变量文件
    cat > .env << EOF
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF

    # 构建并启动Docker容器
    docker-compose -f docker-compose.yml up -d --build

    # 等待容器启动
    log_info "等待Docker容器启动..."
    sleep 15

    # 检查容器状态
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker后端启动成功"
    else
        log_error "Docker后端启动失败"
        docker-compose logs
        exit 1
    fi
}

# 配置前端文件
setup_frontend() {
    log_info "配置前端文件..."

    # 创建Web目录
    mkdir -p $WEB_DIR

    # 复制前端文件
    cp -r $PROJECT_DIR/frontend/* $WEB_DIR/

    # 设置权限
    chown -R www-data:www-data $WEB_DIR
    chmod -R 755 $WEB_DIR

    log_success "前端文件配置完成"
}

# 创建Docker管理服务
create_docker_service() {
    log_info "创建Docker管理服务..."

    cat > /etc/systemd/system/homepage-docker.service << EOF
[Unit]
Description=Homepage Docker Backend Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR/deploy
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    # 重新加载systemd
    systemctl daemon-reload

    # 启用服务（开机自启）
    systemctl enable homepage-docker

    log_success "Docker管理服务创建完成"
}

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx..."

    # 复制nginx配置模板
    cp $PROJECT_DIR/deploy/nginx-site.conf /etc/nginx/sites-available/homepage

    # 替换域名
    sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/homepage

    # 启用站点
    ln -sf /etc/nginx/sites-available/homepage /etc/nginx/sites-enabled/

    # 删除默认站点（可选）
    read -p "是否删除nginx默认站点? (y/N): " remove_default
    if [[ $remove_default =~ ^[Yy]$ ]]; then
        rm -f /etc/nginx/sites-enabled/default
        log_info "已删除默认站点"
    fi

    # 测试nginx配置
    if nginx -t; then
        log_success "Nginx配置测试通过"
        systemctl restart nginx
        log_success "Nginx重启成功"
    else
        log_error "Nginx配置测试失败"
        exit 1
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 5
    
    # 检查后端API
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        log_success "后端API健康检查通过"
    else
        log_error "后端API健康检查失败"
        exit 1
    fi
    
    # 检查前端
    if curl -f http://localhost/ > /dev/null 2>&1; then
        log_success "前端健康检查通过"
    else
        log_error "前端健康检查失败"
        exit 1
    fi
}

# 显示部署信息
show_info() {
    echo ""
    log_success "🎉 混合部署完成！"
    echo ""
    log_info "部署架构："
    log_info "前端: 手动部署到 $WEB_DIR"
    log_info "后端: Docker容器运行在 127.0.0.1:5000"
    echo ""
    log_info "访问信息："
    log_info "主页地址: http://$DOMAIN"
    log_info "管理后台: http://$DOMAIN/admin"
    log_info "API健康检查: http://$DOMAIN/api/health"
    echo ""
    log_info "服务管理："
    log_info "查看Docker状态: cd $PROJECT_DIR/deploy && docker-compose ps"
    log_info "重启Docker后端: cd $PROJECT_DIR/deploy && docker-compose restart"
    log_info "查看Docker日志: cd $PROJECT_DIR/deploy && docker-compose logs -f"
    log_info "查看nginx状态: sudo systemctl status nginx"
    log_info "重启nginx: sudo systemctl restart nginx"
    echo ""
    log_info "文件位置："
    log_info "项目目录: $PROJECT_DIR"
    log_info "前端目录: $WEB_DIR"
    log_info "Docker配置: $PROJECT_DIR/deploy/docker-compose.yml"
    log_info "Nginx配置: /etc/nginx/sites-available/homepage"
    echo ""
    log_info "管理员密码: $ADMIN_PASSWORD"
    echo ""
}

# 主函数
main() {
    echo "🚀 个人主页项目混合部署脚本"
    echo "前端手动部署 + 后端Docker部署"
    echo "================================"

    check_root
    get_config
    install_dependencies
    deploy_files
    setup_docker_backend
    setup_frontend
    create_docker_service
    configure_nginx
    health_check
    show_info
}

# 执行主函数
main "$@"
