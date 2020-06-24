/* eslint-disable consistent-return */
/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
const express = require('express');

const Task = require('../model/task');
const auth = require('../middleware/authorization');

const router = new express.Router();

/**
 * @swagger
 *
 * definitions:
 *   TaskCreate:
 *     type: object
 *     required:
 *       - title
 *     properties:
 *       title:
 *         type: string
 *       dueOn:
 *         type: number
 *       status:
 *         type: string
 *         enum: [1, 2, 3]
 *     example:
 *       title: Sampple Note
 *       dueOn: 1591990140
 *       status: 1
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
 *   Success:
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
 *       error: false
 *       message: Message describing the success
 *   SuccessList:
 *     type: object
 *     required:
 *       - error
 *       - tasks
 *     properties:
 *       error:
 *         type: boolean
 *       tasks:
 *         type: array
 *     example:
 *       error: false
 *       tasks: An array with all the tasks made by the user
 *   SuccessId:
 *     type: object
 *     required:
 *       - error
 *       - task
 *     properties:
 *       error:
 *         type: boolean
 *       task:
 *         type: application/json
 *     example:
 *       error: false
 *       task: The task requested as a json
 */

/**
 * @swagger
 *
 * /task/list:
 *   get:
 *     summary: List all the tasks of the user
 *     description: The request must include Bearer Token in Auth header
 *     parameters:
 *      - in: header
 *        name: Security
 *        schema:
 *          type: string
 *        required: true
 *     responses:
 *       200:
 *         description: Returns all the tasks as an array
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/SuccessList'
 *       404:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.get('/task/list', auth, async (req, res) => {
  try {
    //  Finding all the tasks created by the user
    const tasks = await Task.find({ uId: req._id });

    //  If the previous operation was a scuccess, then send an affirmative reply
    res.status(200).send({
      error: false,
      tasks,
    });
  } catch (e) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 *
 * /task/create:
 *   post:
 *     summary: Create a new task
 *     description: The request must include Bearer Token in Auth header
 *     parameters:
 *      - in: header
 *        name: Security
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/TaskCreate'
 *     responses:
 *       200:
 *         description: The task has been created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Success'
 *       404:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.post('/task/create', auth, async (req, res) => {
  try {
    //  Creating a new object from the Task schema
    const task = new Task();

    //  Defining the properties of the newly created task
    task.uId = req._id;

    if (req.body.dueOn) task.dueOn = parseInt(req.body.dueOn);

    task.title = req.body.title;

    if (req.body.status) task.status = req.body.status;
    else task.status = '1';

    //  Saving the task to the task collection
    await task.save();

    res.status(200).send({
      error: false,
      message: 'The task has been created',
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
 * /task/:id:
 *   get:
 *     summary: List a particular task of the user
 *     description: The request must include Bearer Token in Auth header
 *     parameters:
 *      - in: header
 *        name: Security
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *     responses:
 *       200:
 *         description: The task has been created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/SuccessId'
 *       404:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.get('/task/:id', auth, async (req, res) => {
  //  Getting the ID from the parameter
  const _id = req.params.id;

  try {
    //  Searching the collection for a task with same ID
    const task = await Task.findById(_id);

    if (!task) {
      return res.status(404).send({
        error: true,
        message: 'Task not found',
      });
    }

    res.status(200).send({
      error: false,
      task,
    });
  } catch (e) {
    res.status(500).send({
      error: true,
      message: 'Internal server Error',
    });
  }
});

/**
 * @swagger
 *
 * /task/:id/complete:
 *   patch:
 *     summary: Mark a particular task of the user as Completed
 *     description: The request must include Bearer Token in Auth header
 *     parameters:
 *      - in: header
 *        name: Security
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *     responses:
 *       200:
 *         description: The task has been marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Success'
 *       404:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.patch('/task/:id/complete', auth, async (req, res) => {
  try {
    //  Finding the task by using the input id parameter
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).send({
        error: true,
        message: 'Task not found',
      });
    }

    //  In the enum status, '2' means a task has been completed
    task.status = '2';
    await task.save();

    if (!task) {
      return res.status(404).send();
    }

    res.status(202).send({
      error: false,
      message: 'The tasked was marked as completed',
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
 * /task/:id/archive:
 *   patch:
 *     summary: Mark a particular task of the user as Archived
 *     description: The request must include Bearer Token in Auth header
 *     parameters:
 *      - in: header
 *        name: Security
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *     responses:
 *       200:
 *         description: The task has been marked as archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Success'
 *       404:
 *         description: Invalid credentials
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
router.patch('/task/:id/archive', auth, async (req, res) => {
  try {
    //  Finding task by using the input ID parameter
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).send({
        error: true,
        message: 'Task not found',
      });
    }

    //  In the enum status, '3' means a task has been completed
    task.status = '3';
    await task.save();

    if (!task) {
      return res.status(404).send({
        error: true,
        message: 'Task not found',
      });
    }

    res.status(202).send({
      error: false,
      message: 'The task was archived',
    });
  } catch (e) {
    res.status(400).send({
      error: true,
      message: 'Bad Request',
    });
  }
});

module.exports = router;
