# PoC on Authentication and Authorization

We need to create APIs for simple To Do app where the user can create the account and manage To Do. Also, instead of using only API the user can also create an account using their email ID and a strong password.

## Data Storage

A MongoDB database was used with a total of three databases containing information in the following format:

### Users collection

This collection contains the information of the registered Users
<pre>
{
    _id: 5ede3ffbaecce536d059598a,
    name: Sample Name,
    email: sample@example.com,
    password: S1mple@1,
    apiToken: eyJhbGciOiJIU ... u3U3iXCnQICQ,
    apiExpiresAt: 1591625675
}
</pre>

### Tasks Collection

This collection contains all the tasks of all the users
<pre>
{
    _id: 5ede38c486f558290fc4efcb,
    uId: 5ede38c486f558290fc4efca,
    dueOn: 1591790140,
    title: Sample Task
    status: 1
}
</pre>

where "status" column is an Enum where 1 - Active, 2 - Completed, 3 - Archived

### Tokens Collection

This collection contains the information of the API only users.
<pre>
{
    apiToken: eyJhbGciOiJIU ... yvgji1V5qo1g4,
    apiExpiresAt: 1591625680
}
</pre>

## The app contains the following routes and APIs

### [POST]  /user/login

This API will accept email and password and check against the user database if the credentials are valid or not.

The makeup of the POST request should be like so
<pre>
{
    'email': sample@example.com,
    'password': S1mple@1,
}
</pre>

If the user and password credentials are correct i.e. present in the user collection, then it will return a response containing a message "Logged in Successfully" and the API token of the user.

On the other hand, if the user or password credentials are incorrect i.e. not present in the user collection, then it will return an erroneous response like so
<pre>
{
    error: true,
    message: "Invalid credentials"
}
</pre>

## [POST]   /user/signup

TThis will register the user with a new account i.e. save the requisite information to the user collection provided the user is not already registered, in which case it will throw an error.

The makeup of the POST request should be like so
<pre>
{
    name: Sample Name,
    email: sample@example.com,
    password: S1mple@1
}
</pre>

If the user is registered, it will return a response containing an API token that the user can use in all future interaction with the app.

If the user is not registered, it should throw an error like so
<pre>
{
    error: true,
    message: "Message describing the error"
}
</pre>

## [POST] /user/createApiToken

The app also has the functionality to accept an expiry date as a UTC Timestamp and issue a JWT token that can also be used for all future interactions.

It is a randomly generated token. The response of this is like so

<pre>
{
    apiToken: "eyJhbGciOiJIU ... yvgji1V5qo1g4"
}
</pre>

If the app encounters any errors, such as the expiry date being earlier than the creation date, then it will return an erroneous response like so

<pre>
{
    error: true,
    message: "Message describing the error"
}
</pre>

<!-- The API must be secured and only accessible by logged in user with JWT token. This API should not be accessible with API token. -->

## [GET] /task/list

This API will list all the tasks of the authorized user.

This API can be accessible by both JWT token authorization and API token.

## [POST] /task/create

This API will be used to create the task for the authorized user.

This API can be accessible by both JWT token authorization and API token.

## [GET] /task/{id}/complete

This API will be used to mark the task as complete.

This API can be accessible by both JWT token authorization and API token.

## [GET] /task/{id}/archive

This API will be used to mark the task as archive.

This API can be accessible by both JWT token authorization and API token.

To call an API with API token, the request must have X-Auth-Token header specified in the request headers to validate and authenticate the request.


# Example of Task Creation

First the user should do a **POST** request to */user/signup* with the following json body:
<pre>
{
    "name": "Sample Name",
    "email": "sample@example.com",
    "password": "S1mple@1"
}
</pre>

The response of the above call would be:
<pre>
{
    "error": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWRlNTU3N2RhZTk0ZjQ2MTUzNDMwMDciLCJpYXQiOjE1OTE2MjkxNzUsImV4cCI6MTU5MTcxNTU3NX0.SkkoZP3cNKBJABtPLOS1WQrb3FCGo1VBbidDkl9q1Mc"
}
</pre>

Or, the user can select to use the API version and send a **POST** request to */user/createApiToken* with the following JSON body:
<pre>
{
    "expiresAt": "1591625680"
}
</pre>

And the app will respond by sending the API token back like so
<pre>
{
    "apiToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWRlNTU3N2RhZTk0ZjQ2MTUzNDMwMDciLCJpYXQiOjE1OTE2MjkxNzUsImV4cCI6MTU5MTcxNTU3NX0.SkkoZP3cNKBJABtPLOS1WQrb3FCGo1yvgji1V5qo1g4"
}
</pre>

Then the user should save the Bearer token and use it as the Authorization header for the task create post request.

Lastly, the user should do a **POST** request to */task/create* with the following json body:
<pre>
{
    "dueOn": "1591790140",
    "title": 'Write Code',
    "status": '1'
}
</pre>

The app will then return a status code 200 as a response. Please note that the dueOn property is not required nor is the fact that the dueOn time should be after the current time to accommodate backdated Tasks.
