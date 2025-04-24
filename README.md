# Kaggle Team Leaderboard Fetcher

A NestJS application that fetches and displays team leaderboard data from Kaggle competitions.

## Features

- Fetches team leaderboard data from any public Kaggle competition
- Displays team rankings, scores, and submission dates
- Real-time updates of leaderboard information
- Dockerized for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- Python 3 (for Kaggle CLI in virtual environment)
- Docker and Docker Compose (optional)
- Kaggle API credentials

## Getting Started

### 1. Kaggle API Setup

1. Go to your Kaggle account settings
2. Scroll down to the "API" section
3. Click "Create New API Token"
4. This will download a `kaggle.json` file
5. Place this file in `~/.kaggle/kaggle.json` on your local machine
6. Ensure it has the correct permissions: `chmod 600 ~/.kaggle/kaggle.json`

### 2. Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd kaggle-team-leaderboard-fetcher

# Install dependencies
npm install

# Set up Kaggle CLI in a virtual environment (recommended for Debian/Ubuntu-based systems)
npm run setup:kaggle

# Test Kaggle CLI setup
npm run kaggle:test

# Start the development server
npm run start:dev
```

### 3. Docker Setup

#### Prerequisites
- Docker and Docker Compose installed
- Kaggle API credentials

#### Getting Started

1. Clone the repository

2. Set up Kaggle credentials:
   - Copy `.env.example` to `.env`
   - Update with your Kaggle credentials
   ```
   cp .env.example .env
   ```

3. Build and start the containers:
   ```
   docker-compose up -d
   ```

4. Access the NestJS application at http://localhost:3000

#### Using the Kaggle Service

The Kaggle service container has the Kaggle CLI installed. To use it:

```bash
# Execute commands in the Kaggle container
docker-compose exec kaggle-service kaggle competitions list
```

#### Stopping the Services

```bash
docker-compose down
```

## API Endpoints

### Get Leaderboard
```
GET /leaderboard/:competitionSlug
```

Parameters:
- `competitionSlug`: The URL slug of the Kaggle competition (e.g., 'titanic')

Response:
```json
[
  {
    "TeamId": "12345678",
    "TeamName": "Example Team",
    "SubmissionDate": "2025-04-20 12:34:56.789000",
    "Score": "1.00000"
  },
  ...
]
```

## Environment Variables

- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port (default: 3000)

## Troubleshooting

### Python Environment Issues

If you encounter issues with the Kaggle CLI installation on Debian/Ubuntu systems, use the virtual environment approach:

```bash
# Create and activate a Python virtual environment
python3 -m venv kaggle-env
source kaggle-env/bin/activate

# Install Kaggle inside the virtual environment
pip install kaggle
```

The application is already configured to use the virtual environment when running Kaggle commands.

## Docker Configuration

The application is configured to run in a Docker container with:

- Python 3.9 base image
- Kaggle CLI installed
- Node.js environment
- Volume mounts for:
  - Application code
  - Node modules
  - Kaggle credentials

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
