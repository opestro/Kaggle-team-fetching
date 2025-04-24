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
    curl \
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

# Copy package files
COPY package*.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Create requirements.txt if it doesn't exist
RUN echo "kaggle==1.7.4.2" > requirements.txt

# Copy the application code
COPY . .

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:dev"]