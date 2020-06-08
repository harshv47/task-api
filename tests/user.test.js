const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const app = require('../app')
const User = require('../model/user')

//  Sample ID and token

const User1Id = new mongoose.Types.ObjectId()

const token = jwt.sign({_id: User1Id}, process.env.JWT_SECRET)

//  Sample collection entries, one is saved and the other is used in various tests

const User1 = {
    '_id': User1Id,
    'name': 'Sample Name',
    'email': 'sample@example.com',
    'password': 'S1mple@2@',
    'apiToken': token,
    'apiExpiresAt': (parseInt(Date.now()/1000) + 2000).toString(),
}

const User2 = {
    "name": "Sample Name 2",
    "email": "sample2@example.com",
    "password": "wDDSejnff2321e@@#"
}

//  Fake and Wrong emails and passwords

const wrongEmail = 'example.com'
const fakeEmail = 'fake_' + User2.email
const fakePassword = 'fake_' + User2.password
const smallPassword = 'Da@'
const withoutLCPassword = 'DDSGDGMDKGVMK232DFSF43'
const withoutUCPassword = 'fsfsfs22j3jjj3j23b'
const withoutNumPassword = 'fDFSFSFsfsfsvfsdf'

//  Cleaning and populating the collection before runing each test

beforeEach( async ()=>{
    await User.deleteMany()

    await new User(User1)
        .save()
    
})

//  --------------------------  TESTS   ----------------------------    //

//  User Signup Tests

test('User Signup', async () =>{
    await request(app)
        .post('/user/signup')
        .send(User2)
        .expect(201)
})

test('User Signup with invalid email', async () =>{
    await request(app)
        .post('/user/signup')
        .send({
            'name': User2.name,
            'email': wrongEmail,
            'password': User2.password
        })
})

test('User Signup with duplicate email', async () =>{
    await request(app)
        .post('/user/signup')
        .send({
            "name": User2.name,
            "email": User1.email,
            "password": User2.password
        })
        .expect(400)
})

test('User Signup with password of length less than 7', async () => {
    await request(app)
        .post('/user/signup')
        .send({
            "name": User2.name,
            "email": User2.email,
            "password": smallPassword
        })
        .expect(400)
})

test('User Signup with password without lowercase characters', async () => {
    await request(app)
        .post('/user/signup')
        .send({
            "name": User2.name,
            "email": User2.email,
            "password": withoutLCPassword
        })
        .expect(400)
})

test('User Signup with password without uppercase characters', async () => {
    await request(app)
        .post('/user/signup')
        .send({
            "name": User2.name,
            "email": User2.email,
            "password": withoutUCPassword
        })
        .expect(400)
})

test('User Signup with password without numbers', async () => {
    await request(app)
        .post('/user/signup')
        .send({
            "name": User2.name,
            "email": User2.email,
            "password": withoutNumPassword
        })
        .expect(400)
})

//  User Login Tests

test('User Login', async () =>{
    await request(app)
        .post('/user/login')
        .send({
            'email': User1.email,
            'password': User1.password
        })
        .expect(202)
})

test('User Login with wrong email', async () =>{
    await request(app)
        .post('/user/login')
        .send({
            'email': fakeEmail,
            'password': User1.password
        })
        .expect(400)
})

test('User Login with wrong password', async () =>{
    await request(app)
        .post('/user/login')
        .send({
            'email': User1.email,
            'password': fakePassword
        })
        .expect(400)
})

//  Creating API Token tests

test('User creating a new api Token', async () =>{
    await request(app)
        .post('/user/createApiToken')
        .send({
            'expiresAt': (parseInt(Date.now()/1000) + 2000).toString()
        })
        .expect(200)
})

test('User creating a new api token without expiry date', async () =>{
    await request(app)
        .post('/user/createApiToken')
        .send()
        .expect(400)
})

test('User creating a new API token with backdated expiry date', async () => {
    await request(app)
        .post('/user/createApiToken')
        .send({
            'expiresAt': (parseInt(Date.now()/1000) - 2000).toString()
        })
        .expect(400)
})

