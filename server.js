const mongoose = require('mongoose');
const dotenv = require('dotenv');

// process.on('uncaughtException', (err) => {
//   console.log('uncaughtException shutting down server');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

dotenv.config({ path: './config.env' });
const app = require('./app');

// eslint-disable-next-line import/no-extraneous-dependencies, import/order

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection successfully');
  });

const server = app.listen(3000, () => {
  // eslint-disable-next-line no-console
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unHandler the Rejection');
  server.close(() => {
    process.exit(1);
  });
});
