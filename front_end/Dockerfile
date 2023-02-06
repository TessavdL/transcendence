# FROM node:latest AS development

# RUN mkdir -p /app/srcs/front_end

# WORKDIR /app/srcs/front_end

# COPY ["./chat_front_end/package*.json","."]
# COPY ["./chat_front_end/index.html", "."]

# ENV PATH /app/srcs/front_end/node_modules/.bin:$PATH

# RUN npm install -g vue@latest

# RUN npm install

# COPY . .

# EXPOSE 5173

# CMD ["npm", "run", "dev"]

# # ENTRYPOINT ["tail", "-f", "/dev/null"]

# FROM node:lts-alpine3.14

FROM node:latest
USER node
WORKDIR /app
RUN chown node:node ./
CMD npm install && npm run dev
