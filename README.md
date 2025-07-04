This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses shadcn/ui components, and builds on top of the [Dashboard example](https://ui.shadcn.com/examples/dashboard).

To run it in development mode, copy the `env.local.example` file to `.env.local` and set the `MONGODB_URI` variable to the MongoDB connection string sent to you via email.

To run it in production mode, copy the `env.production.local.example` file to `.env.production.local` and set the `MONGODB_URI` variable to the MongoDB connection string sent to you via email.

## Overview

This application is a data dashboard designed to aggregate, standardize, and display policy and client information from multiple, disparate broker systems. It connects to a MongoDB database to fetch raw data, processes it through a series of API routes, and presents it in a clean, interactive user interface featuring tables and charts.

### API Routes

The core logic is handled by several serverless API routes within the `app/api/` directory:

- **/api/broker1** & **/api/broker2**:

  - These routes connect directly to a MongoDB database (`brokers`) and fetch data from their respective collections (`broker1` and `broker2`). They serve the raw data for each broker system.

- **/api/brokers/standardized**:

  - This is the primary data endpoint for the frontend dashboard. It fetches the raw data from the `broker1` and `broker2` endpoints, transforms their different data structures into a single, standardized format, and returns the combined data. This allows the frontend to work with a consistent data model, regardless of the source.

- **/api/test-db**:
  - A simple utility route used to verify that the connection to the MongoDB database is configured correctly and is operational.

## API Documentation

This project uses [Swagger](https://swagger.io/) to provide interactive API documentation.

[View the API Documentation](./app/docs/page.tsx)
