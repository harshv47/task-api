/* eslint-disable radix */
/* eslint-disable consistent-return */
const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const Tokens = require('../model/apiToken');

const router = new express.Router();
/**
 * @swagger
 *
 * definitions:
 *   NewUser:
 *     type: json
 *     required:
 *       - name
 *       - email
 *       - password
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *         format: email
 *       password:
 *         type: string
 *         format: password
 *       apiToken:
 *         type: string
 *       apiExpiresAt:
 *         type: number
 *   Error:
 *     type: json
 *     required:
 *       - error
 *       - message
 *     properties:
 *       error:
 *         type: boolean
 *       message:
 *         type: string
 *   Success:
 *     type: json
 *     required:
 *       - error
 *       - message
 *     properties:
 *       error:
 *         type: boolean
 *       message:
 *         type: string
 *   SuccessReturn:
 *     type: json
 *     required:
 *       - error
 *       - token
 *     properties:
 *       error:
 *         type: boolean
 *       token:
 *         type: string
 *   SuccessLogin:
 *     type: json
 *     required:
 *       - error
 *       - message
 *       - token
 *     properties:
 *       error:
 *         type: boolean
 *       message:
 *         type: string
 *       token:
 *         type: string
 */

/**
 * @swagger
 *
 * /user/signup:
 *   post:
 *     description: Sign up to the app
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Name
 *         description: User email to use for signup.
 *         in: json
 *         required: true
 *         type: string
 *       - email: "sample@example.com"
 *         description: User email to use for login.
 *         in: json
 *         required: true
 *         type: string
 *       - password: password
 *         description: User's password.
 *         in: json
 *         required: true
 *         type: string
 *     responses:
 *       202:
 *         description: Logged in Successfully
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/SuccessReturn'
 *       404:
 *         description: Invalid credentials
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 *       400:
 *         description: Bad Request
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 */
router.post('/user/signup', async (req, res) => {
  //  Checking password strength
  const passreg = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$');

  if (!passreg.test(req.body.password)) {
    return res.status(400).send({
      error: true,
      message: 'The password must contain at least one lowercase, one uppercase and one number',
    });
  }
  const userAlreadyExists = await User.findOne({ email: req.body.email });

  if (userAlreadyExists) {
    return res.status(400).send({
      error: true,
      message: 'The email is already registered, please use login',
    });
  }

  //  Creating a user object using the User schema
  const user = new User(req.body);

  try {
    //  Creating an apToken for the new user
    const token = await user.generateAuthToken();
    user.apiToken = token;

    //  Saving the user in the User Collection
    await user.save();

    res.status(201).send({
      error: false,
      //  Sending the token back, so that the user could use the Bearer token
      token,
    });
  } catch (e) {
    res.status(400).send({
      error: true,
      message: 'Bad Request',
    });
  }
});

/**
 * @swagger
 *
 * /user/login:
 *   post:
 *     description: Login to the app
 *     produces:
 *       - application/json
 *     parameters:
 *       - email: "sample@example.com"
 *         description: User email to use for login.
 *         in: json
 *         required: true
 *         type: string
 *       - password: password
 *         description: User's password.
 *         in: json
 *         required: true
 *         type: string
 *     responses:
 *       responses:
 *       202:
 *         description: Logged in Successfully
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/SuccessLogin'
 *       404:
 *         description: Invalid credentials
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 *       400:
 *         description: Bad Request
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 */
router.post('/user/login', async (req, res) => {
  try {
    //  Finding the user by there credentials
    const user = await User.findByCredentials(req.body.email, req.body.password);

    if (!user) {
      return res.status(404).send({
        error: true,
        message: 'Invalid credentials',
      });
    }

    res.status(202).send({
      error: false,
      message: 'Logged in Successfully',
      //  Sending the apiToken, so that the user could use the Bearer Token
      apiToken: user.apiToken,
    });
    //  Issue token here, identify what that means!!!
  } catch (e) {
    res.status(400).send({
      error: true,
      message: 'Bad Request',
    });
  }
});

/**
 * @swagger
 *
 * /user/createApiToken:
 *   post:
 *     description: Create an API token to use in api mode
 *     produces:
 *       - application/json
 *     parameters:
 *       - expiresAt: time as a UTC timestamp
 *         description: User email to use for signup.
 *         in: json
 *         required: true
 *         type: string
 *     responses:
 *       202:
 *         description: API key saved
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/SuccessReturn'
 *       400:
 *         description: Bad Request
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 */
router.post('/user/createApiToken', async (req, res) => {
  try {
    // Checking to see if the user has provided expiry date
    if (!req.body.expiresAt) {
      return res.status(400).send({
        error: true,
        message: 'No expiry date provided',
      });
    }

    //  Checking to see if the token has already expired or not
    if (parseInt(req.body.expiresAt) <= Date.now() / 1000) {
      return res.status(400).send({ error: true, message: 'Token is expired' });
    }

    //  Using exipiration unix timestamp as the key for signing jwt token
    const token = jwt.sign({
      _id: req.body.expiresAt, exp: parseInt(req.body.expiresAt),
    }, process.env.JWT_SECRET);

    //  Creating the entry for tokens collection
    const apiToken = new Tokens();
    apiToken.apiToken = token;
    apiToken.apiExpiresAt = parseInt(req.body.expiresAt);

    await apiToken.save();

    res.send({
      error: false,
      apiToken: token,
    });
  } catch (e) {
    res.status(400).send({
      error: true,
      message: 'Bad Request',
    });
  }
});

module.exports = router;
