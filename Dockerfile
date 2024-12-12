# 使用官方 Node.js 映像來建置應用
FROM node:20-alpine AS build

# 設定工作目錄
WORKDIR /app

# 啟用 Corepack 並安裝正確版本的 Yarn
RUN corepack enable \
    && corepack prepare yarn@4.2.2 --activate

# 複製 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安裝相依套件
RUN yarn workspaces focus --production

# 複製所有檔案並建置
COPY . .
RUN yarn build

# 使用 Nginx 作為生產階段
FROM nginx:stable-alpine

# 移除預設的 Nginx 設定
RUN rm /etc/nginx/conf.d/default.conf

# 複製自訂的 Nginx 配置檔案
COPY nginx/default.conf /etc/nginx/conf.d/

# 複製建置後的靜態檔案到 Nginx 目錄
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露埠號
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]