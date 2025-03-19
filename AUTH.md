# Authentication API Documentation

## Email Signup

### Endpoint

- **POST** `/api/auth/sign-up/email`

### Description

This endpoint allows users to sign up for an account using their email and a password.

### Request

- **Headers**

  - `Content-Type: application/json`

- **Body Parameters**
  - `email` (string, required): The user's email address.
  - `password` (string, required): A password for the user's account.

### Response

- **201 Created**

  - **Body**: A JSON object containing a success message and the user's information.

- **400 Bad Request**
  - **Body**: A JSON object with an error message indicating invalid input data.

### Example Request

```json
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
  "name": "John Doe"
}
```

### Example Response

```json
{
  "token": "2iyAQFK5aViX3vr4A4faR5rp6EaOdxJp",
  "user": {
    "id": "4jMT8xQRc6tBKa6fEU1W0n1ocoIJDcQs",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2025-03-19T10:49:20.207Z",
    "updatedAt": "2025-03-19T10:49:20.207Z"
  }
}
```

## Email Sign In

### Endpoint

- **POST** `/api/auth/sign-in/email`

### Description

This endpoint allows users to log in to their account using their email and password.

### Request

- **Headers**

  - `Content-Type: application/json`

- **Body Parameters**
  - `email` (string, required): The user's registered email address.
  - `password` (string, required): The user's account password.

### Response

- **200 OK**

  - **Body**: A JSON object containing an authentication token and user information.

- **401 Unauthorized**
  - **Body**: A JSON object with an error message indicating invalid credentials.

### Example Request

```json
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Example Response

```json
{
  "token": "2iyAQFK5aViX3vr4A4faR5rp6EaOdxJp",
  "user": {
    "id": "4jMT8xQRc6tBKa6fEU1W0n1ocoIJDcQs",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2025-03-19T10:49:20.207Z",
    "updatedAt": "2025-03-19T10:49:20.207Z"
  }
}
```
