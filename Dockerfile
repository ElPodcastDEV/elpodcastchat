FROM node:13.2-alpine
ENV TZ=America/Mexico_City
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /usr/app
COPY package*.json ./
RUN npm install -g nodemon
RUN npm install -g forever
RUN npm install
COPY . .
