FROM node:20-alpine

WORKDIR /app

# Add Python and install Kaggle directly
RUN apk add --no-cache python3 py3-pip && \
    pip3 install kaggle

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Build app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]