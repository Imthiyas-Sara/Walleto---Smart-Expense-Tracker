# 💰 Walleto — Smart Expense Tracker

A modern, full-stack expense management application built with **Next.js 14, TypeScript, MongoDB, and NextAuth.js**.

Walleto helps you track daily expenses, manage your monthly budget, analyze spending patterns, and organize transactions through a clean, 
responsive dark-themed interface.

---

## 📸 Preview

<img width="970" height="756" alt="walleto db" src="https://github.com/user-attachments/assets/4b1462b6-3087-4ac0-8e1a-b6b661496840" />

---

## ✨ Features

### 🏠 Dashboard

* 📊 Real-time budget tracking
* 💰 Total spent and remaining budget overview
* 📅 Today's transactions
* 🥧 Category-based spending breakdown
* 📈 Weekly spending trend
* 🎯 Visual budget progress indicator
* 🚨 Budget status and spending alerts

### 💳 Expense Management

* ➕ Add new expenses
* ✏️ Edit existing expenses
* 🗑️ Delete expenses
* 🔎 Search expenses by title
* 🏷️ Filter by category
* 📅 Filter by date range
* 💵 Quick amount presets
* 📊 Expense statistics

  * Total expenses
  * Number of transactions
  * Average expense
  * Highest expense

### 🕒 Expense History

* 📋 Expenses grouped by date
* 📅 Interactive calendar view
* 🎨 Color-coded spending indicators
* 🔎 Advanced search and filtering
* 💰 Amount range filtering
* ↕️ Sort by date, amount, or title
* ⬆️ Ascending and descending sorting

### ⚙️ Settings

* 💰 Monthly budget management
* 🌎 Multi-currency support
* 👤 User profile management
* 🔐 Secure logout
* 📊 Real-time budget status

---

## 🛠️ Tech Stack

### Frontend

| Technology         | Purpose                          |
| ------------------ | -------------------------------- |
| **Next.js 14**     | React framework with App Router  |
| **React 18**       | User interface                   |
| **TypeScript 5**   | Type safety                      |
| **Tailwind CSS 3** | Styling and responsive design    |
| **Framer Motion**  | Animations and transitions       |
| **date-fns**       | Date manipulation and formatting |

### Backend

| Technology             | Purpose                 |
| ---------------------- | ----------------------- |
| **Next.js API Routes** | Backend API endpoints   |
| **MongoDB**            | Database                |
| **Mongoose**           | MongoDB object modeling |
| **NextAuth.js**        | Authentication          |
| **bcryptjs**           | Password hashing        |

### Deployment

| Platform          | Purpose             |
| ----------------- | ------------------- |
| **MongoDB Atlas** | Cloud database      |

---

## 🏷️ Expense Categories
Walleto supports **15 expense categories** of expense

## 💱 Supported Currencies
Walleto supports multiple currencies

## 🚀 Getting Started

Follow these steps to run Walleto locally.

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/) 18 or later
* MongoDB 6 or later
* npm or yarn

You can use either a local MongoDB installation or [MongoDB Atlas](https://www.mongodb.com/atlas).

---

### 1. Clone the Repository

```bash
git clone https://github.com/Imthiyas-Sara/Walleto---Smart-Expense-Tracker.git
```

Navigate into the project:

```bash
cd Walleto---Smart-Expense-Tracker
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker

NEXTAUTH_SECRET=your-secret-key-here

NEXTAUTH_URL=http://localhost:3000
```

### 4. Start MongoDB

For a local MongoDB installation:

```bash
mongod
```

Alternatively, configure your `MONGODB_URI` to use a MongoDB Atlas database.

---

### 5. Start the Development Server

```bash
npm run dev
```

---

### 6. Open the Application

Visit:

```text
http://localhost:3000
```

---


## 🎯 Key Highlights

* ✅ Real-time budget tracking
* ✅ Expense CRUD operations
* ✅ 15 expense categories
* ✅ Multi-currency support
* ✅ Interactive calendar history
* ✅ Advanced search and filtering
* ✅ Weekly spending analytics
* ✅ Category-based analytics
* ✅ Budget progress tracking
* ✅ Secure authentication
* ✅ Password hashing with bcrypt
* ✅ Responsive design
* ✅ Modern dark theme
* ✅ Expense export functionality

---

## 🔐 Security

Walleto includes several security-focused features:

* 🔒 Password hashing with `bcryptjs`
* 🔑 NextAuth.js authentication
* 👤 User-specific expense data
* 🔐 Environment variables for sensitive configuration
* 🛡️ Protected API routes
  
---


## 📄 License

This project is currently available for educational and personal use.

---

## 👨‍💻 Author

**Imthiyas Sara**

GitHub: https://github.com/Imthiyas-Sara

---

**Walleto — Track smarter. Spend better. Save more. 💰**
