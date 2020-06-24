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
 *   User:
 *     type: object
 *     required:
 *       - name
 *       - email
 *       - password
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *     example:
 *       name: Sample Name
 *       email: sample@example.com
 *       password: S1mpl3@1
 *   UserLogin:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *     example:
 *       email: sample@example.com
 *       password: S1mpl3@1
 *   ApiToken:
 *     type: object
 *     required:
 *       - expiresAt
 *     properties:
 *       expiresAt:
 *         type: number
 *     example:
 *       expiresAt: 2595532378
 *   Error:
 *     type: object
 *     required:
 *       - error
 *       - message
 *     properties:
 *       error:
 *         type: boolean
 *       message:
 *         type: string
 *     example:
 *       error: true
 *       message: Message describing the error
 *   SuccessReturn:
 *     type: object
 *     required:
 *       - error
 *       - token
 *     properties:
 *       error:
 *         type: boolean
 *       token:
 *         type: string
 *     example:
 *       error: false
 *       message: Message describing the success
 *   SuccessLogin:
 *     type: object
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
 *     example:
 *       error: false
 *       message: Logged in Succesfully
 */

/**
 * @swagger
 *
 * /user/signup:
 *   post:
 *     requestBody:
 *       description: Signs up a new user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/User'
 *     responses:
 *       201:
 *         description: Signed up Successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/SuccessReturn'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.post('/user/signup', async (req, res) => {
  //  Checking password strength
  const passreg = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$');

  if (req.body === {}) {
    return res.status(400).send({
      error: true,
      message: 'Empty Request',
    });
  }

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
 *     requestBody:
 *       description: Logs in an existing user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/UserLogin'
 *     responses:
 *       202:
 *         description: Logged in Successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/SuccessLogin'
 *       404:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
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
 *     requestBody:
 *       description: Creates a new API token and returns it
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ApiToken'
 *     responses:
 *       202:
 *         description: API key saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/SuccessReturn'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
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
