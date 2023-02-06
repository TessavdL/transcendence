# FROM node:latest AS development

# RUN mkdir -p /app/srcs/back_end

# WORKDIR /app/srcs/back_end

# COPY ["./chat_back_end/package*.json","."]
# COPY ["./chat_back_end/tsconfig*.json", "."]

# RUN npm install -g @nestjs/cli

# RUN npm install source-map-support

# COPY . .

# EXPOSE 3001

# CMD ["npm", "run", "start"]

# FROM node:lts-alpine3.14

FROM node:latest
USER node
WORKDIR /app
RUN chown node:node ./
CMD npm install && npm run start:dev
