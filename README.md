# 💸 Cash Flow Minimizer

A full-stack web application that **minimizes inter-bank transactions** using **graph algorithms and greedy optimization**. Built as a DSA project demonstrating real-world application of **Max Heaps, Graph Theory, and Greedy Algorithms**.

## 🧠 DSA Concepts Used

| Concept | Application |
|---------|-------------|
| **Max Heap** (Priority Queue) | Greedily matches the largest debtor with the largest compatible creditor |
| **Graph Theory** | Models cash flows as a directed weighted graph between banks |
| **Greedy Algorithm** | Minimizes the number of transactions to settle all debts |
| **Payment-Type Matching** | Ensures debtor-creditor pairs share compatible payment methods |

### How the Algorithm Works

1. **Compute net amounts** — For each bank, calculate `incoming - outgoing` from all transactions
2. **Classify banks** — Separate into debtors (net < 0) and creditors (net > 0)
3. **Build max-heaps** — Insert debtors and creditors into separate max-heaps
4. **Greedy matching** — Pop the largest debtor, find the largest compatible creditor
5. **Settle minimum** — Transaction amount = `min(debtor_debt, creditor_credit)`
6. **Push remainder** — Re-insert any remaining amounts back into heaps
7. **Repeat** until all debts are settled

**Time Complexity**: O(N × K × log N) where N = banks, K = avg payment types  
**Space Complexity**: O(N)

## 🏗️ Tech Stack

### Frontend
- ⚛️ React + Vite
- 🎨 Tailwind CSS v4
- 🗃️ Redux Toolkit
- 🔀 React Router

### Backend
- 🟢 Node.js + Express
- 🍃 MongoDB Atlas + Mongoose
- 🔐 JWT Authentication

## 📁 Project Structure

```
├── backend/
│   ├── models/          # Mongoose schemas (User, Bank, Transaction)
│   ├── routes/          # REST API routes (auth, banks, transactions, optimize, analytics)
│   ├── middleware/       # JWT authentication middleware
│   ├── utils/
│   │   └── optimizer.js # ⭐ Core algorithm — MaxHeap greedy optimizer
│   └── server.js        # Express server entry point
├── frontend/
│   └── src/
│       ├── components/  # Layout with sidebar navigation
│       ├── pages/       # Login, Dashboard, Banks, Transactions, Optimizer, Reports
│       ├── store/       # Redux Toolkit slices
│       └── services/    # Axios API client
└── pro.py               # Original Python CLI reference
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/Lohi712/Cash-Flow-Minimizer.git
cd Cash-Flow-Minimizer
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
PORT=5000
MONGODB_URI=mongodb+srv://your_user:your_pass@cluster0.xxxxx.mongodb.net/cashflow
JWT_SECRET=your_secret_key
```

Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`

## 📸 Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Register/Login with JWT tokens |
| 🏦 **Bank Management** | Add/delete banks with payment type support |
| 💸 **Transactions** | Add/filter/delete transactions between banks |
| ⚡ **Optimizer** | Run the greedy algorithm — see before/after comparison |
| 📊 **Dashboard** | Overview stats, most active bank, top debtor/creditor |
| 📈 **Reports** | Monthly summaries, cash flow prediction |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET/POST/DELETE | `/api/banks` | Bank CRUD |
| GET/POST/DELETE | `/api/transactions` | Transaction CRUD |
| POST | `/api/optimize` | Run cash flow minimization |
| GET | `/api/analytics/overview` | Dashboard analytics |
| GET | `/api/analytics/summary` | Monthly summary |
| GET | `/api/analytics/prediction/:bankId` | Cash flow prediction |

## 📜 License

This project is licensed under the MIT License.