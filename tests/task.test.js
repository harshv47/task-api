/* eslint-disable no-undef */
/* eslint-disable radix */
/* eslint-disable quote-props */
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../app');
const User = require('../model/user');
const Task = require('../model/task');
const Tokens = require('../model/apiToken');

//  Real and fake ids and tokens

const User1Id = new mongoose.Types.ObjectId();
const FakeUserId = new mongoose.Types.ObjectId();

const Task1Id = new mongoose.Types.ObjectId();
const FakeTaskId = new mongoose.Types.ObjectId();

const token = jwt.sign({ _id: User1Id }, process.env.JWT_SECRET);
const Faketoken = jwt.sign({ _id: FakeUserId }, process.env.JWT_SECRET);

const apitoken = jwt.sign({ _id: Date.now() / 1000 + 2000 }, process.env.JWT_SECRET);
const Fakeapitoken = jwt.sign({ _id: Date.now() / 1000 + 5000 }, process.env.JWT_SECRET);

//  Sample collection entries

const User1 = {
  '_id': User1Id,
  'name': 'Sample Name',
  'email': 'sample@example.com',
  'password': 'S1mple@2@',
  'apiToken': token,
  'apiExpiresAt': (parseInt(Date.now() / 1000) + 2000),
};

const Task1 = {
  '_id': Task1Id,
  'uId': User1Id,
  'dueOn': (parseInt(Date.now() / 1000) + 2000),
  'title': 'Sample Task',
  'status': '1',
};

const Task2 = {
  'dueOn': (Date.now() / 1000 + 2000),
  'title': 'Write Code',
  'status': '1',
};

const apiToken1 = {
  'apiToken': apitoken,
  'apiExpiresAt': (parseInt(Date.now() / 1000) + 2000).toString(),
};

//  Cleaning and populatng the collection before running each test

beforeEach(async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await Tokens.deleteMany();

  await new User(User1)
    .save();

  await new Task(Task1)
    .save();

  await new Tokens(apiToken1)
    .save();
});

//  --------------------------  TESTS   ----------------------------    //

//  Create tasks

test('Create Task', async () => {
  await request(app)
    .post('/task/create')
    .set('Authorization', `Bearer ${token}`)
    .send(Task2)
    .expect(200);
});

test('Create Task without token', async () => {
  await request(app)
    .post('/task/create')
    .send(Task2)
    .expect(401);
});

test('Create Task with wrong token', async () => {
  await request(app)
    .post('/task/create')
    .set('Authorization', `Bearer ${Faketoken}`)
    .send(Task2)
    .expect(401);
});

//  Create Task by API

test('Create Task with API', async () => {
  await request(app)
    .post('/task/create')
    .set('Authorization', `Bearer ${apitoken}`)
    .send(Task2)
    .expect(200);
});

test('Create Task with wrong API token', async () => {
  await request(app)
    .post('/task/create')
    .set('Authorization', `Bearer ${Fakeapitoken}`)
    .send(Task2)
    .expect(401);
});

//  List All Tasks

test('List tasks by a logged in user', async () => {
  await request(app)
    .get('/task/list')
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(200);
});

//  List All Tasks for APi

test('List tasks by a logged in user without token', async () => {
  await request(app)
    .get('/task/list')
    .send()
    .expect(401);
});

test('List tasks by an API user', async () => {
  await request(app)
    .get('/task/list')
    .set('Authorization', `Bearer ${apitoken}`)
    .send()
    .expect(200);
});

//  List by ID

test('List tasks by a logged in user by task id', async () => {
  await request(app)
    .get(`/task/${Task1Id}`)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(200);
});

test('List tasks by a logged in user by wrong task id', async () => {
  await request(app)
    .get(`/task/${FakeTaskId}`)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(404);
});

test('List tasks by a logged in user by task id with wrong token', async () => {
  await request(app)
    .get(`/task/${Task1Id}`)
    .set('Authorization', `Bearer ${Faketoken}`)
    .send()
    .expect(401);
});

//  List by ID for API

test('List tasks by an API user by task id', async () => {
  await request(app)
    .get(`/task/${Task1Id}`)
    .set('Authorization', `Bearer ${apitoken}`)
    .send()
    .expect(200);
});

test('List tasks by an API user by wrong task id', async () => {
  await request(app)
    .get(`/task/${FakeTaskId}`)
    .set('Authorization', `Bearer ${apitoken}`)
    .send()
    .expect(404);
});

test('List tasks by an API user by task id with wrong token', async () => {
  await request(app)
    .get(`/task/${Task1Id}`)
    .set('Authorization', `Bearer ${Fakeapitoken}`)
    .send()
    .expect(401);
});

//  Update Task as Completed

test('Updates the task for a logged in user to be marked as completed', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(202);
});

test('Updates the task for a logged in user to be marked as completed without token', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .send()
    .expect(401);
});

test('Updates the task for a logged in user to be marked as completed with wrong token', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .set('Authorization', `Bearer ${Faketoken}`)
    .send()
    .expect(401);
});

test('Updates the task for a logged in user to be marked as completed using wrong ID', async () => {
  await request(app)
    .patch(`/task/${FakeTaskId}/complete`)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(404);
});

//  Update Task as Completed using API

test('Updates the task for an API user to be marked as completed', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .set('Authorization', `Bearer ${apitoken}`)
    .send()
    .expect(202);
});

test('Updates the task for an API user to be marked as completed without token', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .send()
    .expect(401);
});

test('Updates the task for an API user to be marked as completed with wrong token', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .set('Authorization', `Bearer ${Fakeapitoken}`)
    .send()
    .expect(401);
});

test('Updates the task for an API user to be marked as completed using wrong ID', async () => {
  await request(app)
    .patch(`/task/${FakeTaskId}/complete`)
    .set('Authorization', `Bearer ${apitoken}`)
    .send()
    .expect(404);
});

//  Updaet Task as Archived

test('Updates the task for a logged in user to be marked as Archived', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(202);
});

test('Updates the task for a logged in user to be marked as Archived without token', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .send()
    .expect(401);
});

test('Updates the task for a logged in user to be marked as Archived with wrong token', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .set('Authorization', `Bearer ${Faketoken}`)
    .send()
    .expect(401);
});

test('Updates the task for a logged in user to be marked as Archived using wrong ID', async () => {
  await request(app)
    .patch(`/task/${FakeTaskId}/complete`)
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(404);
});

//  Update Task as Archived using API

test('Updates the task for an API user to be marked as Archived', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .set('Authorization', `Bearer ${apitoken}`)
    .send()
    .expect(202);
});

test('Updates the task for an API user to be marked as Archived without token', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .send()
    .expect(401);
});

test('Updates the task for an API user to be marked as Archived with wrong token', async () => {
  await request(app)
    .patch(`/task/${Task1Id}/complete`)
    .set('Authorization', `Bearer ${Fakeapitoken}`)
    .send()
    .expect(401);
});

test('Updates the task for an API user to be marked as Archived using wrong ID', async () => {
  await request(app)
    .patch(`/task/${FakeTaskId}/complete`)
    .set('Authorization', `Bearer ${apitoken}`)
    .send()
    .expect(404);
});
