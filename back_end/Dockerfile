FROM node:latest

USER node

WORKDIR /app

COPY ./back_end/app/prisma ./prisma/ 
COPY ./test.sh /test.sh

RUN chown node:node ./
RUN /app/test.sh

EXPOSE 3001

CMD npm install && \
    npx prisma generate && \
    npm run start:dev
