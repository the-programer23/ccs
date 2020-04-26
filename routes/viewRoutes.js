/* eslint-disable */
const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.use(middleware) executes the middleware for all the routes below
// router.use(authController.isLoggedIn);

router.use(viewsController.alerts)

router.get('/', authController.isLoggedIn, viewsController.getHome);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/emailConfirmed/:token', authController.protect, viewsController.emailConfirmed)
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/chat', authController.protect, viewsController.getChat)
router.get('/changeData', authController.protectfor1min, viewsController.getUserDataForm)


router.post('/submit-user-data', authController.protect, viewsController.updateUserData);


module.exports = router;