FROM node:lts-alpine
WORKDIR /usr/app
COPY . .
ENV TZ=America/Mexico_City
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime &&\
 echo $TZ > /etc/timezone &&\
 npm install -g forever &&\
 npm install
