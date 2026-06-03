# BoxFruit Inventory Backend

A secure REST API for managing fruit inventory, sales, purchases, shop transfers, expenses, damages, customers, and reporting across multiple stores.

## Features

* User Authentication & Authorization (JWT)
* Inventory Management
* Product Management
* Purchase Tracking
* Sales Management
* Customer Management
* Shop Inventory Tracking
* Stock Transfers Between Shops
* Damage Tracking
* Expense Management
* Pricing Management
* Payment Methods
* Reporting & Analytics
* Swagger API Documentation
* Security Middleware (Helmet, CORS, CSRF, Rate Limiting, XSS Protection)

---

## Tech Stack

### Backend

* Node.js
* Express.js
* Sequelize ORM
* MySQL

### Security

* JWT Authentication
* bcryptjs Password Hashing
* Helmet
* Express Rate Limit
* CSRF Protection
* XSS Protection
* HPP Protection

### Documentation

* Swagger UI
* Swagger JSDoc

---

## Project Structure

```text
├── config/
│   ├── database.js
│   └── swagger.js
│
├── controllers/
│   ├── customerController.js
│   ├── damageController.js
│   ├── expenseController.js
│   ├── itemController.js
│   ├── paymentMethodController.js
│   ├── pricingController.js
│   ├── purchaseController.js
│   ├── reportControllers.js
│   ├── salesController.js
│   ├── shopController.js
│   ├── shopInventoryController.js
│   ├── transferController.js
│   └── userController.js
│
├── models/
├── routes/
├── utils/
├── logs/
├── index.js
└── package.json
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd boxfruitinventory
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=boxfruit_inventory
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

SESSION_SECRET=your_session_secret
```

---

## Running the Application

### Development

```bash
npm start
```

The application will start using Nodemon.

### Production

```bash
node index.js
```

---

## API Documentation

Swagger documentation is available after starting the server:

```text
http://localhost:5000/api-docs
```

---

## Main Modules

### Users

* Register User
* Login User
* Manage Roles and Permissions

### Items

* Create Items
* Update Items
* Delete Items
* List Inventory Items

### Purchases

* Record Purchases
* View Purchase History

### Sales

* Record Sales
* Sales History
* Revenue Tracking

### Customers

* Customer Registration
* Customer Purchase History

### Shop Inventory

* Inventory Per Shop
* Stock Monitoring

### Transfers

* Transfer Stock Between Shops

### Damages

* Record Damaged Products
* Track Inventory Loss

### Expenses

* Record Operational Expenses
* Expense Reporting

### Pricing

* Product Pricing Management

### Reports

* Sales Reports
* Inventory Reports
* Expense Reports
* Transfer Reports

---

## Security Features

* JWT Authentication
* Password Hashing with bcryptjs
* Rate Limiting
* CSRF Protection
* Helmet Security Headers
* XSS Protection
* HTTP Parameter Pollution Protection
* Secure Session Management

---

## Logging

Application logs are stored in:

```text
logs/
├── combined.log
└── error.log
```

---

## Testing API

You can test APIs using:

* Postman
* Swagger UI

Included collection:

```text
BoxFruitInventory.postman_collection.json
```

Import it into Postman to quickly test all endpoints.

---

## Database

The application uses MySQL through Sequelize ORM.

Ensure the database exists before running:

```sql
CREATE DATABASE boxfruit_inventory;
```

---

## Available Scripts

### Start Development Server

```bash
npm start
```

### Run Tests

```bash
npm test
```

---

## License

ISC License

---

## Author

minte Inventory Management System
