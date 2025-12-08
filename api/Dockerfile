# 1. 開発環境用の設定
FROM node:20-alpine

WORKDIR /app

# 依存パッケージのインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピー
COPY . .

# 開発サーバー起動（ホットリロード対応）
CMD ["npm", "run", "start:dev"]