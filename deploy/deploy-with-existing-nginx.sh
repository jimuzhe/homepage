#!/bin/bash

# 个人主页项目部署脚本 - 适用于已有nginx的服务器
# 作者: LongDz
# 用途: 在已有nginx的Linux服务器上部署个人主页项目

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    if [[ $EUID -eq 0 ]]; then
        log_warn "检测到root用户，建议使用普通用户运行此脚本"
        read -p "是否继续? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 检查必要的命令
check_dependencies() {
    log_info "检查系统依赖..."
    
    local deps=("docker" "docker-compose" "nginx")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            log_error "$dep 未安装，请先安装"
            exit 1
        fi
    done
    
    log_success "系统依赖检查完成"
}

# 获取配置信息
get_configuration() {
    echo ""
    log_info "配置部署参数..."
    
    # 域名配置
    read -p "请输入您的域名 (例: homepage.example.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        DOMAIN="localhost"
        log_warn "未输入域名，使用默认值: localhost"
    fi
    
    # 项目路径
    read -p "请输入项目部署路径 (默认: /var/www/homepage): " PROJECT_PATH
    PROJECT_PATH=${PROJECT_PATH:-/var/www/homepage}
    
    # 管理员密码
    read -p "请输入管理员密码 (默认: LongDz6299): " ADMIN_PASSWORD
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-LongDz6299}
    
    echo ""
    log_info "配置信息："
    log_info "域名: $DOMAIN"
    log_info "项目路径: $PROJECT_PATH"
    log_info "管理员密码: $ADMIN_PASSWORD"
    echo ""
}

# 创建项目目录
create_directories() {
    log_info "创建项目目录..."
    
    sudo mkdir -p $PROJECT_PATH
    sudo mkdir -p $PROJECT_PATH/logs
    sudo mkdir -p $PROJECT_PATH/data
    
    # 设置权限
    sudo chown -R $USER:$USER $PROJECT_PATH
    
    log_success "项目目录创建完成"
}

# 复制前端文件
copy_frontend() {
    log_info "复制前端文件..."
    
    # 复制前端文件到nginx目录
    sudo cp -r ../frontend/* $PROJECT_PATH/
    
    # 确保配置文件存在
    if [[ ! -f $PROJECT_PATH/public/config.json ]]; then
        sudo cp ../frontend/public/config.json $PROJECT_PATH/public/
    fi
    
    # 设置权限
    sudo chown -R www-data:www-data $PROJECT_PATH
    sudo chmod -R 755 $PROJECT_PATH
    
    log_success "前端文件复制完成"
}

# 配置nginx
configure_nginx() {
    log_info "配置nginx..."
    
    # 复制nginx配置文件
    sudo cp nginx-site.conf /etc/nginx/sites-available/homepage
    
    # 替换域名
    sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/homepage
    
    # 创建软链接
    sudo ln -sf /etc/nginx/sites-available/homepage /etc/nginx/sites-enabled/
    
    # 测试nginx配置
    if sudo nginx -t; then
        log_success "nginx配置测试通过"
        sudo systemctl reload nginx
        log_success "nginx配置已重载"
    else
        log_error "nginx配置测试失败"
        exit 1
    fi
}

# 启动Docker容器
start_docker() {
    log_info "启动Docker容器..."
    
    # 创建环境变量文件
    cat > .env << EOF
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF
    
    # 启动容器
    docker-compose -f docker-compose.yml up -d
    
    # 等待容器启动
    log_info "等待容器启动..."
    sleep 10
    
    # 检查容器状态
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker容器启动成功"
    else
        log_error "Docker容器启动失败"
        docker-compose logs
        exit 1
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
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
show_deployment_info() {
    echo ""
    log_success "🎉 部署完成！"
    echo ""
    log_info "访问信息："
    log_info "主页地址: http://$DOMAIN"
    log_info "管理后台: http://$DOMAIN/admin"
    log_info "API健康检查: http://$DOMAIN/api/health"
    echo ""
    log_info "管理信息："
    log_info "项目路径: $PROJECT_PATH"
    log_info "Docker容器: homepage-backend"
    log_info "nginx配置: /etc/nginx/sites-available/homepage"
    echo ""
    log_info "常用命令："
    log_info "查看容器状态: docker-compose ps"
    log_info "查看容器日志: docker-compose logs -f"
    log_info "重启容器: docker-compose restart"
    log_info "停止容器: docker-compose down"
    log_info "重载nginx: sudo systemctl reload nginx"
    echo ""
}

# 主函数
main() {
    echo "🚀 个人主页项目部署脚本 v1.0"
    echo "适用于已有nginx的Linux服务器"
    echo ""
    
    check_root
    check_dependencies
    get_configuration
    create_directories
    copy_frontend
    configure_nginx
    start_docker
    health_check
    show_deployment_info
}

# 执行主函数
main "$@"
