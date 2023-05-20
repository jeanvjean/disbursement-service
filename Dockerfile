FROM node:14.15.1-alpine3.10 As builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

RUN npm install -g nodemon

RUN npm install pm2 -g

COPY . .

EXPOSE 3348

CMD [ "nodemon", "bin/app.js" ]

#RUN ["pm2 ", "startOrRestart workers.config.js --env production"]