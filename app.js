/* eslint-disable */
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/membershipRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingController = require('./controllers/membershipController');


// Start app
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARE
// Implement CORS - // Access-Control-Allow-Origin * (* means all)
app.use(cors());

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Set security http headers
app.use(helmet());
// Develoment login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'demasiadas solicitudes de esta ip, intente nuevamente en una hora.',
});

app.use('/api', limiter);


// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);
// This code allows us to get the form input data from the browser in req.body
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsAverage',
//       'ratingsQuantity',
//       'maxGroupSize',
//       'difficulty',
//       'price',
//     ],
//   })
// );

app.use(compression());

// 3) Routes
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/tickets', bookingRouter);

app.all('*', (req, res, next) => {
  next(
    // req.originalUrl is the string after /
    new AppError(`No se pudo encontrar ${req.originalUrl} en el servidor`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;