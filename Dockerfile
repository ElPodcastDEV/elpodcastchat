FROM node:13.2-alpine
ENV TZ=America/Mexico_City
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /usr/app
COPY package.json ./
RUN npm install -g nodemon &&\
    npm install -g forever &&\
    npm install &&\
    npm ls
COPY . .
