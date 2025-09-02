# ENVIRONMENT.md

# Environment Variables Documentation

This document outlines the environment variables required for the production-ready application. Ensure that these variables are set in your environment before running the application.

## Backend Environment Variables

- `PORT`: The port on which the backend server will run. Default is `3000`.
  
- `DATABASE_URL`: The connection string for the database. This should include the database type, username, password, host, and database name.

- `CACHE_TTL`: The time-to-live for cached data in seconds. Default is `3600` (1 hour).

- `JWT_SECRET`: A secret key used for signing JSON Web Tokens for authentication.

- `NODE_ENV`: The environment in which the application is running. Set to `production` for production environments.

## Frontend Environment Variables

- `REACT_APP_API_URL`: The base URL for the backend API that the frontend will communicate with.

- `REACT_APP_ENV`: The environment in which the frontend application is running. Set to `production` for production builds.

## Setting Environment Variables

You can set these environment variables in your terminal or by creating a `.env` file in the root of your project. For example:

```
PORT=3000
DATABASE_URL=mongodb://username:password@host:port/database
CACHE_TTL=3600
JWT_SECRET=your_jwt_secret
NODE_ENV=production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

Make sure to replace the placeholder values with your actual configuration.