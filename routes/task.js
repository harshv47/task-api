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
 *   NewUser:
 *     type: json
 *     required:
 *       - uId
 *       - title
 *     properties:
 *       uId:
 *         type: string
 *       dueOn:
 *         type: number
 *       title:
 *         type: string
 *       status:
 *         type: enum
 *         format: ['1', '2', '3']
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
 *   SuccessList:
 *     type: json
 *     required:
 *       - error
 *       - tasks
 *     properties:
 *       error:
 *         type: boolean
 *       tasks:
 *         type: array
 *   SuccessId:
 *     type: json
 *     required:
 *       - error
 *       - task
 *     properties:
 *       error:
 *         type: boolean
 *       task:
 *         type: json
 */

/**
 * @swagger
 *
 * /task/list:
 *   get:
 *     description: List all tasks of the user
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: Returns all the tasks as an array
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/SuccessList'
 *       404:
 *         description: Invalid credentials
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
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
 *     description: Create new tasks
 *     produces:
 *       - application/json
 *     parameters:
 *       - task: Title
 *         description: Title of the Task.
 *         in: json
 *         required: true
 *         type: string
 *       - dueOn: 1591790140
 *         description: The due time of the task in UTC timestamp
 *         in: json
 *         required: true
 *         type: number
 *       - status: 1
 *         description: The status of the task, 1, 2 & 3 is Incomplete, Completed and Archived resp.
 *         in: json
 *         required: true
 *         type: enum/number
 *     responses:
 *       200:
 *         description: The task has been created
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Success'
 *       404:
 *         description: Invalid credentials
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 */
router.post('/task/create', auth, async (req, res) => {
  try {
    //  Creating a new object from the Task schema
    const task = new Task();

    //  Defining the properties of the newly created task
    task.uId = req._id;
    task.dueOn = parseInt(req.body.dueOn);
    task.title = req.body.title;
    task.status = req.body.status;

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
 * /task/;id:
 *   get:
 *     description: Create new tasks
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: The task has been created
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/SuccessId'
 *       404:
 *         description: Invalid credentials
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
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
 * /task/;id/complete:
 *   get:
 *     description: Set the task as completed
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: The task has been marked as completed
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Success'
 *       404:
 *         description: Invalid credentials
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
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
 * /task/;id/archive:
 *   get:
 *     description: Set the task as archived
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: The task has been marked as arcived
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Success'
 *       404:
 *         description: Invalid credentials
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: json
 *           items:
 *             $ref: '#/definitions/Error'
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
