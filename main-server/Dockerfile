# Use official Node.js LTS version
FROM node:lts

# Set working directory
WORKDIR /usr/src/app

# Copy dependency definitions first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .


ENV PORT=3000
# Expose a port (can be overridden by docker-compose or run command)
EXPOSE 3000

# Start the app
CMD ["npm", "run","dev"]
