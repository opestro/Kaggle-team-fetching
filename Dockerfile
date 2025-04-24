# Use Node.js with Python as base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install Python and other dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create and activate a virtual environment
RUN python3 -m venv /opt/kaggle-env

# Install Kaggle in the virtual environment
RUN . /opt/kaggle-env/bin/activate && \
    pip install kaggle && \
    deactivate

# Configure Kaggle directory
ENV KAGGLE_CONFIG_DIR=/root/.kaggle

# Add virtual environment bin to PATH
ENV PATH="/opt/kaggle-env/bin:${PATH}"

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Install TypeScript dependencies and build
RUN npm install --save-dev @types/node @types/csv-parser

# Create requirements.txt if it doesn't exist
RUN [ -f requirements.txt ] || echo "kaggle" > requirements.txt

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:dev"]