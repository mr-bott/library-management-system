# Library Management System - Backend

A robust, RESTful backend API for managing a library system, built with Node.js, Express.js, and MongoDB. 
Features role-based access control (Librarian vs Member), secure authentication, and full CRUD capabilities for books and members.

## Features

- **Role-Based Authentication:** JWT-based secure login.
- **Member Features:** Register, login, browse books, borrow, return, and view borrow history.
- **Librarian Features:** Full management over books (CRUD) and members (View/Delete).
- **Advanced API Design:** Versioned routes (`/api/v1/...`), centralized error handling, and robust input validation using `express-validator`.
- **Bonus Implementations:**
  - **Pagination, Search & Filtering:** Implemented on the `GET /api/v1/books` endpoint.
  - **Refresh Tokens:** Implemented a secure access/refresh token rotation flow for better user experience and security.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Security:** bcrypt (password hashing), jsonwebtoken (JWT auth)
- **Validation:** express-validator
- **Logging:** morgan

## Installation and Local Setup

1. **Clone the repository** (or download the source code).
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Environment Variables:**
   Create a `.env` file in the root directory based on the `.env.example` (or use the following template):
   ```env
   PORT=5000
   DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/library?retryWrites=true&w=majority
   JWT_SECRET=supersecretjwtkey_change_in_production
   JWT_REFRESH_SECRET=supersecret_refresh_key_change_in_production
   ```
4. **Run the server (Development Mode):**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

## API Documentation

All routes are prefixed with `/api/v1`

### Authentication (`/auth`)
- `POST /register` - Register a new member.
- `POST /login` - Login and receive Access + Refresh tokens.
- `POST /refresh` - Use refresh token to get a new access token.

### Books (`/books`)
- `GET /` - View all books. Supports `?page=1&limit=10`, `?search=title`, and `?category=Fiction`. (Publicly accessible if authenticated)
- `GET /:id` - View specific book details.
- `POST /` - Add a new book (Librarian only).
- `PUT /:id` - Update a book (Librarian only).
- `DELETE /:id` - Delete a book (Librarian only).
- `POST /:id/borrow` - Borrow a book (Member only).
- `POST /:id/return` - Return a book (Member only).

### Members (`/members`)
- `GET /` - List all members (Librarian only). Supports `?page=1&limit=10`.
- `DELETE /:id` - Delete a member (Librarian only).
- `GET /me/books` - View currently borrowed books (Member only).

## Database Setup

The project uses MongoDB. You can easily set up a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
Once your cluster is created, get the connection string and place it in your `.env` file under `DATABASE_URL`.
Mongoose will automatically create the `users`, `books`, and `borrows` collections when you start inserting data.

## How to Run

1. Ensure your MongoDB Atlas connection string is correct in `.env`.
2. Run `npm run dev`.
3. Use Postman to test the endpoints.
4. **First Step:** Register a new user using the `/api/v1/auth/register` endpoint.
5. **Admin Access:** To test Librarian features, open your MongoDB Atlas dashboard (or use MongoDB Compass), find the user you just registered, and manually change their `role` field from `"member"` to `"librarian"`.
