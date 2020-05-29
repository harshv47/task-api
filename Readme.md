# PoC on Authentication and Authorisation

We need to create APIs for simple To Do app where the user can create the account and manage To Do.

Create a MongoDB database with users and tasks collection, which will have users information like:

<pre>
users
{
    _id: 210212121212add1,
    name: "Kamlesh Chetnani",
    email: "kamlesh@saleshandy.com",
    password: "pass123",
    apiToken: "asdasdjasjhj12hjkh21j2j12",
    apiExpiresAt: 1590644190
}
</pre>
<pre>
tasks
{
    _id: 434343423adasd12,
    uId: 210212121212add1,
    dueOn: 1590644190,
    title: "Test task"
    status: 1
}
</pre>
status column is an Enum where 1 - Active, 2 - Completed, 3 - Archieved

# Create following APIs:


## POST /user/login

This API will accept email and password and check against the user database if the credentials are valid or not.

If the user is available and credentials are correct, then it should issue JWT token which will be later used for authorisation of user.

If the user doesn't exists or credentials are invalid, then API should throw an error:
<pre>
{
    error: true,
    message: "Invalid credentials"
}
</pre>

## POST /user/signup

This API will accept name, email, and password of the user to create an account. The user should not be already registed with the same email address.

If the user is created properly, it should issue JWT token which will be later used for authorisation.

If the user is not created due to any error, it should throw an error like:
<pre>
{
    error: true,
    message: "Message describing the error"
}
</pre>

## POST /user/createApiToken

This API will accept timestamp (UTC) as an expiry date for API token.

The token needs to be randomly generated and returned in output on success.
<pre>
{
    apiToken: "asdasdjasjhj12hjkh21j2j12"
}
</pre>
If there is any error in creating the token, it should return error response describing the error details.
<pre>
{
    error: true,
    message: "Message describing the error"
}
</pre>

The API must be secured and only accessible by logged in user with JWT token. This API should not be accessible with API token.

## GET /task/list

This API will list all the tasks of the authorised user.

This API can be accessible by both JWT token authorisation and API token.

## POST /task/create

This API will be used to create the task for the authorised user.

This API can be accessible by both JWT token authorisation and API token.

## GET /task/{id}/complete

This API will be used to mark the task as complete.

This API can be accessible by both JWT token authorisation and API token.

## GET /task/{id}/archive

This API will be used to mark the task as archive.

This API can be accessible by both JWT token authorisation and API token.

To call an API with API token, the request must have X-Auth-Token header specified in the request headers to validate and authenticate the request.

You can use your personal github repository for codebase.
