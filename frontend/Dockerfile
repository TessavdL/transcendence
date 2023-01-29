# Specifiy image && Name it as development
FROM node:18 As development

# Set working directory inside container
WORKDIR /app

# Copy package files from host inside the containers working directory
COPY package*.json ./

#Install dependencies inside container
RUN npm install
# RUN npm install -g @vue/cli

# Bundle App Sources
COPY . .

# Inform Docker that container listens on 3000 at runtime
EXPOSE 8080

# Start a dev server
CMD npm run serve