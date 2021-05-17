<p align="center">
   <img alt="pocassist" src="pic.assets/logo.png" width="200"/>
   <h3 align="center">POCASSIST Web</h3>
</p>

## 介绍

本项目为 [pocassist](https://github.com/jweny/pocassist) 的前端项目。由react + antd开发。

![登录页](pic.assets/登录页.jpg)



![漏洞描述](pic.assets/漏洞描述.jpg)



![漏洞描述详情](pic.assets/漏洞描述详情.jpg)



![poc](pic.assets/poc.jpg)



![poc编辑](pic.assets/poc编辑.jpg)



![poc运行结果](pic.assets/poc运行结果.jpg)

## 使用

### 开发者模式

`yarn start` 

将运行于 [http://localhost:3000](http://localhost:3000) 

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


