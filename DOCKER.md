# Chii Docker 部署指南

## 构建镜像

```bash
docker build -t @mizuka-wu/chii .
```

## 运行容器

```bash
docker run -p 8080:8080 @mizuka-wu/chii
```

## 构建参数

- 使用Node.js 18基础镜像
- 包含所有必要的构建依赖
- 自动初始化前端代码

## 注意事项

- 确保构建时网络通畅，需要下载depot_tools
- 默认暴露8080端口
