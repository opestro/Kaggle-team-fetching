FROM node:20-alpine

WORKDIR /app

# Add Python
RUN apk add --no-cache python3 py3-pip python3-dev build-base

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Set up Kaggle virtual environment
COPY requirements.txt ./
RUN python3 -m venv /app/kaggle-env && \
    /app/kaggle-env/bin/pip install --upgrade pip && \
    /app/kaggle-env/bin/pip install -r requirements.txt

# Set environment variable to use virtual env
ENV VIRTUAL_ENV=/app/kaggle-env
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy app code
COPY . .

# Build app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]