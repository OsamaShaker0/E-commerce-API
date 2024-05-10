require('dotenv').config();
require('express-async-errors');
// express
const express = require('express');
const app = express();
// routes import
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
// rest of packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
// data base import
const connectDB = require('./db/connect');
// routes
const authRouter = require('./routes/authRoutes');
//middlewares
const notFound = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));
app.use(fileUpload());

//NOTE - routes
app.get('/', (req, res) => {
  res.send(
    '<h1>E-commerce-API</h1> <a href="https://documenter.getpostman.com/view/31038051/2sA3JM61oa">API DOCS</a>'
  );
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/orders', orderRoutes);

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = 5000 || process.env.PORT;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`server is listing on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
