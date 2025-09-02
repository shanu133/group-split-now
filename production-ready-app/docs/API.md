# API Documentation

## Overview
This document provides an overview of the API endpoints available in the application, including their request and response formats, as well as usage examples.

## Base URL
The base URL for all API endpoints is:
```
http://localhost:3000/api
```

## Endpoints

### 1. Get All Items
- **Endpoint:** `/items`
- **Method:** `GET`
- **Description:** Retrieves a list of all items.
- **Response:**
  - **Status Code:** 200 OK
  - **Body:**
    ```json
    [
      {
        "id": "1",
        "name": "Item 1",
        "description": "Description of Item 1"
      },
      {
        "id": "2",
        "name": "Item 2",
        "description": "Description of Item 2"
      }
    ]
    ```

### 2. Get Item by ID
- **Endpoint:** `/items/:id`
- **Method:** `GET`
- **Description:** Retrieves a single item by its ID.
- **Parameters:**
  - `id` (string): The ID of the item to retrieve.
- **Response:**
  - **Status Code:** 200 OK
  - **Body:**
    ```json
    {
      "id": "1",
      "name": "Item 1",
      "description": "Description of Item 1"
    }
    ```
  - **Status Code:** 404 Not Found (if item does not exist)
  - **Body:**
    ```json
    {
      "error": "Item not found"
    }
    ```

### 3. Create Item
- **Endpoint:** `/items`
- **Method:** `POST`
- **Description:** Creates a new item.
- **Request Body:**
  ```json
  {
    "name": "New Item",
    "description": "Description of the new item"
  }
  ```
- **Response:**
  - **Status Code:** 201 Created
  - **Body:**
    ```json
    {
      "id": "3",
      "name": "New Item",
      "description": "Description of the new item"
    }
    ```

### 4. Update Item
- **Endpoint:** `/items/:id`
- **Method:** `PUT`
- **Description:** Updates an existing item by its ID.
- **Parameters:**
  - `id` (string): The ID of the item to update.
- **Request Body:**
  ```json
  {
    "name": "Updated Item",
    "description": "Updated description"
  }
  ```
- **Response:**
  - **Status Code:** 200 OK
  - **Body:**
    ```json
    {
      "id": "1",
      "name": "Updated Item",
      "description": "Updated description"
    }
    ```
  - **Status Code:** 404 Not Found (if item does not exist)
  - **Body:**
    ```json
    {
      "error": "Item not found"
    }
    ```

### 5. Delete Item
- **Endpoint:** `/items/:id`
- **Method:** `DELETE`
- **Description:** Deletes an item by its ID.
- **Parameters:**
  - `id` (string): The ID of the item to delete.
- **Response:**
  - **Status Code:** 204 No Content (if successful)
  - **Status Code:** 404 Not Found (if item does not exist)
  - **Body:**
    ```json
    {
      "error": "Item not found"
    }
    ```

## Error Handling
All API responses will include appropriate HTTP status codes and error messages for failed requests. 

## Conclusion
This API provides a simple interface for managing items within the application. For further details on authentication and other features, please refer to the relevant sections in the documentation.