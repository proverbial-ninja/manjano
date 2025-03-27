# Entries API Documentation

## Endpoints

### GET /api/entries

- **Description**: Returns a list of all entries for the user.

### POST /api/entries

- **Description**: Creates a new entry.

### POST /api/entries/:id

- **Description**: Updates an existing entry.

### DELETE /api/entries/:id

- **Description**: Deletes an existing entry.

## Request

- **Headers**

  - `Cookie`: `access_token=<token>` or `id_token=<token>`

- **Body Parameters**
  - `title` (string, required): The title of the entry.
  - `content` (string, required): The content of the entry.
  - `tags` (array, optional): An array of tags for the entry.
