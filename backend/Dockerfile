# 使用轻量级的Python Alpine镜像，节省空间和提升性能
FROM python:3.11-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖（如果需要）
RUN apk add --no-cache \
    gcc \
    musl-dev \
    wget \
    && rm -rf /var/cache/apk/*

# 复制requirements文件并安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非root用户以提高安全性
RUN adduser -D -s /bin/sh appuser && \
    chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 5000

# 设置环境变量
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# 使用Gunicorn作为WSGI服务器，提升性能
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "2", "--worker-class", "gthread", "app:app"]
