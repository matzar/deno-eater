# Data Dashboard - Broker Policy Management



https://github.com/user-attachments/assets/6b6354da-7d59-4369-8917-2e1518203c1a



> A Next.js-powered data dashboard for aggregating and visualizing policy information from multiple broker systems.

This project is built with [Next.js](https://nextjs.org) and uses [shadcn/ui](https://ui.shadcn.com/examples/dashboard) components for a modern, responsive interface.

## Overview

This application is a data dashboard designed to aggregate, standardize, and display policy and client information from multiple, disparate broker systems. It connects to a MongoDB database to fetch raw data, processes it through a series of API routes, and presents it in a clean, interactive user interface featuring tables and charts.

## Features

- **Interactive Dashboard**: Provides a user-friendly interface with tables and charts for data visualization.
- **Data Standardization**: Combines and transforms data from multiple broker systems into a consistent format.
- **API Documentation**: Explore and test API endpoints using Swagger UI.
- **Environment-Specific Authentication**: Supports X.509 certificate authentication for development and username/password authentication for production.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js 22.17.0 or higher
- pnpm (recommended package manager)

**Installing pnpm:**
If you don't have pnpm installed, you can install it using one of these methods:

```bash
# Using npm
npm install -g pnpm

# Using Homebrew (macOS)
brew install pnpm

# Using curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

For more installation options, see the [pnpm installation guide](https://pnpm.io/installation).

> **Note:** npm is not supported due to dependency resolution conflicts with React 19. Please use pnpm, yarn, or bun.

### Installation

Install the dependencies using pnpm:

```bash
pnpm install
```

**Alternative package managers:**

```bash
# For pnpm
pnpm install

# For yarn
yarn install

# For bun
bun install

# For npm
npm install --legacy-peer-deps
```

> **Note:** npm is not officially supported due to dependency resolution conflicts with React 19. If you use npm, you must run `npm install --legacy-peer-deps` and use Node.js 22.17.0 or higher.

### Running the Development Server

Start the development server:

```bash
pnpm dev
# or
yarn dev
# or
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

This project uses [shadcn/ui](https://ui.shadcn.com/examples/dashboard) components, building on top of the [Dashboard example](https://ui.shadcn.com/examples/dashboard).

## Data Setup

The `.csv` files were imported into the MongoDB database using [MongoDB Compass](https://www.mongodb.com/products/compass). During the import process, `Ignore empty strings` was **not** checked to ensure that all data is imported, including empty fields. This allows the application to handle missing data gracefully.

To connect to the MongoDB database, you need to set up the environment by following the instructions below.

## Environment Setup

This project uses different authentication methods for development and production environments:

### Development Environment (X.509 Certificate Authentication)

1. **Create the certificates directory:**

```bash
mkdir -p certs
```

2. **Download the certificate file:** Download `X509-cert-6924067380824752665.pem` from 1Password and place it in the `certs` folder at the project root.

3. **No environment file needed:** Development mode automatically uses the certificate file for MongoDB authentication.

### Production Environment (Username/Password Authentication)

Create `.env.production.local` in the project root, copy the contents of `.env.production.local.example`, and replace `<1Password MongoDB connection string>` with the actual MongoDB connection string from 1Password.

```bash
cp env.production.local.example .env.production.local
```

## Architecture

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



https://github.com/user-attachments/assets/473721d0-8c0a-498a-af99-c2b8cf255311



This project uses [Swagger](https://swagger.io/) to provide interactive API documentation.

To explore the API, navigate to the `/docs` route in your browser - http://localhost:3000/docs. This will display the Swagger UI, allowing you to interact with the API endpoints, view request and response formats, and test the API directly from the browser.
