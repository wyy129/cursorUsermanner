FROM node:18-alpine AS builder

# 构建Vue应用
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Python运行环境
FROM python:3.10-slim

WORKDIR /app

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制Python后端
COPY app.py .

# 复制构建好的Vue前端
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 7860

# 启动应用
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]

