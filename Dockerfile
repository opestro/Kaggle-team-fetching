 # Use Python 3.9 as base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Kaggle CLI
RUN pip install kaggle

# Copy the kaggle.json file (this should be mounted at runtime)
# The kaggle.json file should be placed in ~/.kaggle/kaggle.json
ENV KAGGLE_CONFIG_DIR=/root/.kaggle

# Copy application files
COPY . .

# Install Python dependencies
RUN pip install -r requirements.txt

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:dev"]