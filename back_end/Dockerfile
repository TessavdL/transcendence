FROM node:latest

USER node

WORKDIR /app

COPY ./back_end/app/prisma ./prisma/ 

RUN chown node:node ./

EXPOSE 3001

CMD npm install && \
    npx prisma generate && \
    npm run start:dev
