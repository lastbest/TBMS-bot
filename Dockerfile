FROM node:18

# 타임존 설정
ENV TZ=Asia/Seoul

# 작업 디렉토리 생성
WORKDIR /app

# 종속성 설치
COPY package*.json ./
RUN npm install

# 앱 복사
COPY . .

# 포트 열기 (필요에 따라)
EXPOSE 3000

# 앱 실행
CMD ["node", "server.js"]
