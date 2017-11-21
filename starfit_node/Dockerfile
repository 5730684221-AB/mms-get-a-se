from node:latest

ADD . /app

RUN cd /app; \  
    npm install

EXPOSE 3000

WORKDIR /app
VOLUME /app

CMD ["npm","start"]  