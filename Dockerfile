FROM node:latest
ENV TZ=America/Mexico_City
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /usr/app
COPY . .
RUN npm install -g nodemon &&\
 npm install -g forever &&\
 npm install &&\
 npm run build
