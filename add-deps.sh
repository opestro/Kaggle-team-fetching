#!/bin/bash

# Install required type declarations
npm install --save-dev @types/node @types/csv-parser

# Install missing dev dependencies for NestJS
npm install --save-dev typescript ts-node tsconfig-paths @types/express

# Ensure all dependencies are installed
npm install

echo "Dependency installation complete. Please rebuild the Docker container with:"
echo "docker-compose down && docker-compose up --build" 