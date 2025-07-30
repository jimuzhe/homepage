# 个人主页项目 Docker 镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# 复制后端文件
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# 安装 Python 依赖
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
RUN pip install --no-cache-dir gunicorn

# 配置 Nginx
COPY deploy/nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default
RUN ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# 配置 Supervisor
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 创建日志目录
RUN mkdir -p /var/log/supervisor /var/log/nginx /app/logs

# 设置权限
RUN chown -R www-data:www-data /app
RUN chmod +x /app/backend/app.py

# 暴露端口
EXPOSE 80

# 启动命令
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
