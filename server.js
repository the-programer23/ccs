/* eslint-disable */
const mongoose = require('mongoose');
const dotenv = require('dotenv');


process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTIION 🔥  Shutting down...');
    console.log(err.name, err.message, err);
    process.exit(1);
})

dotenv.config({
    path: './config.env'
});
const app = require('./app')

// console.log(process.env);
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connetion successful to the database');
    });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`The server is up on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION 🔥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
});

process.on('SIGTERM', () => {
    console.log('✋ SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('🔥 Process terminated!')
    })
})