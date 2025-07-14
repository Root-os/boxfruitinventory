const mysql = require('mysql2/promise');
const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// ✅ Create DB if not exists
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`✅ Database "${process.env.DB_NAME}" ensured.`);
    await connection.end();

    // ✅ Now import Sequelize models AFTER DB is ensured
    const db = require('./models');

    // ✅ Middlewares
    app.use(helmet());
    app.use(cors({ origin: '*', credentials: true }));
    app.use(compression());
    app.use(express.json());

    // ✅ Routes
    require('./config/swagger')(app);
    app.use('/api/items', require('./routes/itemRoutes'));
    app.use('/api/customers', require('./routes/customerRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/shops', require('./routes/shopRoutes'));
    app.use('/api/purchases', require('./routes/purchaseRoutes'));
    app.use('/api/shop-inventory', require('./routes/shopeInventorry'));
    app.use('/api/expenses', require('./routes/expenseRoutes'));
    app.use('/api/sales', require('./routes/salesRoutes'));
    app.use('/api/damages', require('./routes/damageRoutes'));
    app.use('/api/reports', require('./routes/reportRotues'));
    app.use('/api/pricing', require('./routes/pricingRoutes'));

    // ✅ Sync Sequelize models
    db.sequelize.sync({ force : false }).then(() => {
      console.log('Database synced successfully.');
    }).catch((err) => {
      console.error('DB sync error:', err);
    });

    // ✅ Start server
    const PORT = process.env.PORT || 3006;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Error ensuring database:', err);
    process.exit(1);
  }
})();
