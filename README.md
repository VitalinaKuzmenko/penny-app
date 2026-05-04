# Penny App

🌐 https://www.pennyapp.co.uk

Penny App is a personal finance management tool built to help users understand and control their spending by analyzing bank CSV files and cash expenses in one place.

It was created to solve a real problem: tracking family finances across multiple accounts without relying on direct bank integrations.

---

## 🚧 Project Status

The project is currently **in active development**.

Some features may be incomplete or evolving.

---

## 💡 Features

- Upload bank CSV files and import transactions
- Add cash expenses manually
- Unified view of spending across accounts
- Custom transaction categorization
- Insights into income, spending, and savings trends
- Secure authentication system
- Works with any bank (no direct integration required)

---

## 🧱 Tech Stack

### Frontend
- React
- Next.js
- TypeScript
- Material UI

### Backend
- Node.js
- NestJS
- REST APIs
- Swagger

### Database & ORM
- PostgreSQL
- Prisma ORM

### Validation & Utilities
- Zod
- JWT authentication
- Winston logging (Loki integration)

### Architecture
- Monorepo setup
- Shared schemas package

---

## 📦 Project Structure

This is a monorepo containing multiple packages:

- `penny-app-ui` – Frontend application
- `penny-app-server` – Backend API
- `schemas` – Shared TypeScript schemas
- `schemas-nest` – NestJS-compatible schemas

---

## 🛠️ Setup

### Install dependencies (monorepo)
```bash
pnpm install
```

### Build all packages
```bash
pnpm -r run build
```

### 🧩 Individual Builds
If you need to build specific packages:
```bash
pnpm --filter schemas run build
pnpm --filter schemas-nest run build
pnpm --filter penny-app-ui run build
pnpm --filter penny-app-server run build
```

### 🚀 Development Goals
Improve transaction parsing and normalization
Expand analytics and insights dashboard
Enhance UX for budgeting and categorization
Add support for multiple import formats

---

### 📌 Motivation
Penny App was built as a practical solution to simplify personal and family financial tracking, turning raw bank data into clear, actionable insights.

---

### 📄 License
This project is currently private / in development.
