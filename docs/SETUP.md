# Backend Setup Guide

## Prerequisites
- Node.js (v18+)
- MySQL
- Redis (for BullMQ)

## Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env` (refer to `.env.example`).
3. Initialize the database:
   ```bash
   npm run migration:run
   ```
4. (Optional) Seed initial data:
   ```bash
   npm run seed
   ```

## Development
- Run in dev mode:
  ```bash
  npm run start:dev
  ```
- Build for production:
  ```bash
  npm run build
  ```

## Environment Variables
| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL database host |
| `DB_PORT` | MySQL database port |
| `RESEND_API_KEY` | Resend SDK API Key |
| `S3_ENDPOINT` | DO Spaces/S3 Endpoint |
| `S3_BUCKET_NAME` | Storage bucket name |
