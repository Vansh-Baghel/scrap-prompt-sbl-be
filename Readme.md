# Application Setup Guide

This guide will help you set up and run the application locally.

## Prerequisites

- Node.js 16 or higher
- A database (PostgreSQL)
- Groq API Key ([Get one here](https://console.groq.com/))

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying the sample file:

```bash
cp .env.sample .env
```

Open the `.env` file and configure the following variables:

#### Required Configuration

**DATABASE_URL** - Your database connection string

Examples:
```env
# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

**GROQ_API_KEY** - Your Groq API key for AI functionality

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your Groq API key from [Groq Console](https://console.groq.com/).

#### Other Variables

Keep all other variables from `.env.sample` as they are, unless you need to customize them for your specific setup.

### 4. Set Up the Database

Generate the database schema:

```bash
npx drizzle-kit generate
```

Push the schema to your database:

```bash
npx drizzle-kit push
```

**Note:** If you encounter any errors, ensure your `DATABASE_URL` is correctly configured and your database server is running.

### 5. Run the Application

Start the development server:

```bash
pnpm dev
```

The application should now be running at `http://localhost:3000` (or the port specified in your configuration).

## Project Structure

```
.
├── .env                 # Environment variables (not in git)
├── .env.sample          # Sample environment configuration
├── package.json         # Project dependencies
├── drizzle.config.ts    # Database configuration
└── src/                 # Application source code
```