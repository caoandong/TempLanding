# build phase
FROM node:alpine

WORKDIR '/app'

COPY package*.json ./
COPY . .
RUN npm install

RUN npm run build

# run phase
FROM nginx

EXPOSE 80

COPY --from=0 /app/dist  /usr/share/nginx/html

# nginx automatically starts
