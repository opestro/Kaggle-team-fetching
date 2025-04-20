# Kaggle Team Leaderboard Fetcher

A NestJS application that fetches and displays team leaderboard data from Kaggle competitions.

## Features

- Fetches team leaderboard data from any public Kaggle competition
- Displays team rankings, scores, and submission dates
- Real-time updates of leaderboard information
- Dockerized for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Kaggle API credentials

## Getting Started

### 1. Kaggle API Setup

1. Go to your Kaggle account settings
2. Scroll down to the "API" section
3. Click "Create New API Token"
4. This will download a `kaggle.json` file
5. Place this file in `~/.kaggle/kaggle.json` on your local machine

### 2. Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd kaggle-team-leaderboard-fetcher

# Install dependencies
npm install

# Start the development server
npm run start:dev
```

### 3. Docker Setup

```bash
# Build and start the container
docker-compose up --build

# The application will be available at http://localhost:3000
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
