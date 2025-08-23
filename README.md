# The **Phonebook Backend**

A RESTful API backend for the **Phonebook App**, providing user authentication and contact management.
Built with **Node.js**, **Express**, and **MongoDB**.

## 🚀 Features

- User registration, login, refresh, and logout
- Secure password hashing with **bcrypt**
- Authentication and authorization
- CRUD operations for contacts (create, read, update, delete)
- Input validation and error handling

## 🛠️ Technologies

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- Bcrypt
- CORS
- dotenv

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/IvanGodPro24/phonebook-backend.git
```

2. Navigate to the project directory:

```bash
cd phonebook-backend
```

3. Install dependencies:

```bash
npm install
```

4. Create a .env file in the project root and add the required environment variables listed in .env.example

5. Run the project:

```bash
npm run dev
```

## 🌐 API Endpoints

- Auth

  - `POST /users/register` — register
  - `POST /users/login` — login
  - `GET /users/refresh` — refresh user session
  - `POST /users/logout` — logout

- Contacts

  - `GET /contacts` — list contacts
  - `POST /contacts` — create contact
  - `DELETE /contacts/:id` — delete contact
  - `PATCH /contacts/:id` — upsert contact
  - `PUT /contacts/:id` — update contact

## 📁 Project Structure

```bash
src/
├── constants/       # Constants
├── controllers/     # Request handlers
├── middlewares/     # Authentication, error handling
├── db/
│   └── models/      # Mongoose models
├── routes/          # API routes
├── service/         # Services
├── validation/      # Validation schemas
├── utils/           # Helpers
├── templates/       # Handlebars templates
├── server.js        # App entry point
```
