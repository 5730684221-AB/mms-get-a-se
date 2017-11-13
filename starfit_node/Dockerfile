from node:4

ADD . /app

RUN cd /app; \  
    npm install --production

EXPOSE 8123

CMD ["node", "/app/index.js"]  