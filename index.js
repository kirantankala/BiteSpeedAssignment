require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const identifyRoutes = require('./routes/identify');
const debugRoutes = require('./routes/debug'); // <- ADD THIS

const app = express();
app.use(express.json());

app.use('/', identifyRoutes);//for uploading the user
app.use('/', debugRoutes); // for deleting

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Tables synced');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch(err => console.error(' DB connection error:', err));
