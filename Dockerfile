FROM node:20-alpine

WORKDIR /app

# Add Python
RUN apk add --no-cache python3 py3-pip

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Set up Kaggle virtual environment
COPY requirements.txt ./
RUN python3 -m venv kaggle-env && \
    ./kaggle-env/bin/pip install -r requirements.txt

# Copy app code
COPY . .

# Build app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 