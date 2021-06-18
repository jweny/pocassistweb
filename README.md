![pocassist](https://socialify.git.ci/jweny/pocassist/image?description=1&font=Inter&forks=1&issues=1&language=1&logo=https%3A%2F%2Favatars1.githubusercontent.com%2Fu%2F26767398&owner=1&pattern=Floating%20Cogs&pulls=1&stargazers=1&theme=Dark)



## 介绍

本项目为 [pocassist](https://github.com/jweny/pocassist) 的前端项目。由react + antd开发。

## Demo

### 登录页

![登录页](pic/登录页.jpg)

### 规则首页

![规则首页](pic/规则首页.jpg)

### 规则详情

![规则详情](pic/规则详情.jpg)

### 单挑规则靶机测试

![单条规则靶机测试](pic/单条规则靶机测试.png)

### 漏洞描述首页

![漏洞描述首页](pic/漏洞描述首页.jpg)

### 漏洞描述详情

![漏洞描述详情](pic/漏洞描述详情.png)

### 新建批量扫描任务

![新建扫描任务](pic/新建扫描任务.png)

### 任务首页

![任务首页](pic/任务首页.png)

### 扫描结果

![扫描结果](pic/扫描结果.jpg)

### 结果首页

![结果首页](pic/结果首页.jpg)

### 组件首页

![组件首页](pic/组件首页.jpg)

## 使用

### 开发者模式

`yarn start` 

将运行于 [http://localhost:3333](http://localhost:3333)

### 线上部署

打包：`yarn build`

安装nginx，修改nginx.conf反向代理后端。

```
upstream pocassistAPI {
				# 配置后端端口
        server 127.0.0.1:1231;
    }
server {
        listen       80;
        location / {
        		# 配置build文件夹路径
            root /opt/pocassistWEB/build/;
        }

        location /api/ {
            proxy_pass http://pocassistAPI/api/;
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }
```

