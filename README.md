# File Transfer Apps

Example project demonstrating file upload and download functionality in a React web app and a React Native (Expo) mobile app, powered by a Fastify backend.

## Description

This project features a backend with three key endpoints for file handling:

- `GET /download` - Downloads a file.
- `POST /upload-multiples` - Uploads multiple files using `multipart/form-data`.
- `POST /upload-octet-stream` - Uploads a file using `application/octet-stream`.

Uploaded files are stored in the `/uploads` directory.

The endpoints are integrated with a React web app and a React Native mobile app, demonstrating file upload and download functionality across both platforms.
