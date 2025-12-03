# 1. Node.jsのバージョン20（軽量版）を使う
FROM node:20-alpine
RUN apk add --no-cache openssl

# 2. コンテナ内の作業ディレクトリを /app に設定
WORKDIR /app

# 3. パッケージ定義ファイルをコピー
COPY package*.json ./

# 4. ライブラリをインストール
RUN npm install

# 5. ソースコードを全てコピー
COPY . .

# 6. TypeScriptをビルド（JSに変換）
RUN npm run build

# 7. 起動コマンド（ビルドされたJSを実行）
CMD ["node", "dist/index.js"]