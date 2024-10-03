# 77Roll Backend

This is the backend repository for 77Roll, a web-based gaming platform featuring games like Coinflip and Roulette. This backend is built using Node.js, Express, and MongoDB, and handles the core functionality such as user authentication, gameplay mechanics, transactions, and more.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the App](#running-the-app)
- [Environment Variables](#environment-variables)

## Features

- **Authentication**: Secure authentication with JWT.
- **Game Mechanisms**: Coinflip and Roulette with provably fair algorithms.
- **User Profiles**: Users can track their statistics, balance, and transactions.
- **Transactions**: Cryptocurrency-based deposit and withdrawal using CoinPayments.
- **WebSocket Integration**: Real-time multiplayer features using Socket.IO.

## Tech Stack

- **Node.js**: Backend runtime.
- **Express.js**: Web framework for handling routing and middleware.
- **MongoDB**: Database for storing user, game, and transaction data.
- **JWT**: Authentication via JSON Web Tokens.
- **CoinPayments**: Cryptocurrency transaction integration.
- **Socket.IO**: Real-time communication for multiplayer games.
- **TypeScript**: Strongly typed JavaScript for robust code.

## Prerequisites

Before running the backend locally, make sure you have:

- Node.js (v18.x or above)
- MongoDB (Local or remote instance)
- A Cloudinary account with API keys
- A CoinPayments account with API keys

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/cuteanbogdan/77roll-backend.git
   cd 77roll-backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up MongoDB**:

   - Ensure MongoDB is running locally or configure access to a remote MongoDB instance.

4. **Configure environment variables**:
   Create a `.env` file in the root directory and add the necessary environment variables (see [Environment Variables](#environment-variables)).

## Running the App

To start the backend server:

```bash
npm run build
npm start
```

The server should now be running on `http://localhost:8080`. You can change the port in the `.env` file if needed.

### Running in Development Mode

To run the server in development mode with hot-reloading:

```bash
npm run dev
```

## Environment Variables

You need to define the following environment variables in the `.env` file:

```env
PORT=8080
MONGO_URI=<Your MongoDB connection string>
JWTSecretKey=<Your JWT secret key>
NODE_ENV=development || production
CLIENT_URL=<Your client URL>

# Cloudinary integration
CLOUDINARY_CLOUD_NAME=<Your Cloudinary cloud name>
CLOUDINARY_API_KEY=<Your Cloudinary API key>
CLOUDINARY_API_SECRET=<Your Cloudinary API secret key>

# CoinPayments integration
COINPAYMENTS_API_KEY=<Your CoinPayments API key>
COINPAYMENTS_API_SECRET=<Your CoinPayments API secret>
COINPAYMENTS_IPN_SECRET=<Your CoinPayments IPN secret>
BASE_URL=<Your backend base URL, e.g., http://localhost:8080>
```
