# Chii Docker 部署指南

## 使用官方镜像（推荐）

我们提供了基于 NPM 包的最小化 Docker 镜像，可以直接使用：

```bash
docker run -p 8080:8080 mizukawu/chii
```

## 使用 docker-compose

```yaml
services:
  chii:
    image: mizukawu/chii
    container_name: chii
    ports:
      - '8080:8080'
    restart: unless-stopped
```

## 自行构建最小镜像

如果您想自行构建最小镜像，可以使用项目中的 publishDockerFile：

```bash
docker build -t mizukawu/chii-mini -f publishDockerFile .
docker run -p 8080:8080 mizukawu/chii-mini
```

## 从源码构建完整镜像

如果您需要从源码构建完整镜像，可以使用项目中的 Dockerfile：

```bash
docker build -t mizukawu/chii-full .
docker run -p 8080:8080 mizukawu/chii-full
```

## 镜像说明

### 官方镜像（最小化）
- 基于 Node.js 18-slim 基础镜像
- 直接使用 NPM 上发布的 @mizuka-wu/chii 包
- 体积小，启动快
- 支持 linux/amd64 和 linux/arm64 平台

### 完整镜像
- 包含所有源码和构建依赖
- 自动初始化前端代码
- 体积较大
- 需要下载 depot_tools 等依赖

## 注意事项

- 默认暴露 8080 端口
- 在 ARM64 架构（如 M1/M2 Mac）上运行时，需要使用 platform: linux/amd64 配置
