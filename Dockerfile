# 使用Node.js官方镜像作为基础
FROM node:18

# 设置工作目录
WORKDIR /app

# 安装基础依赖
RUN apt-get update && apt-get install -y git curl xz-utils python3-pkg-resources python3-virtualenv python3-oauth2client

# 安装depot_tools并设置环境变量
RUN git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

# 安装npm依赖
RUN npm i -g @liriliri/lsla

# 复制项目文件
COPY package.json package-lock.json* ./ 
COPY . .

# 设置depot_tools路径
ENV PATH="/app/depot_tools:${PATH}"

RUN npm i

# 初始化前端代码
RUN npm run init:front_end

# 执行构建
RUN npm run build

# 暴露服务端口
EXPOSE 8080

# 启动命令
CMD ["node", "bin/chii.js", "start"]

# 构建命令示例:
# docker build -t chii-docker .
# 运行命令示例:
# docker run -p 8080:8080 chii-docker
