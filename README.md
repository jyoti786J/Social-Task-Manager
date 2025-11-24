📝 Social To-Do List Application
A full-stack web application that allows users to manage their tasks with Facebook authentication, file uploads, and a complete RESTful API.

🎯 Overview
This is a collaborative To-Do list application where users can:
- Log in securely using their Facebook account
- Create, read, update, and delete tasks
- Upload files attached to tasks
- Access tasks via a RESTful API

✨ Features
🔐 Authentication
- Facebook OAuth Login - Secure social authentication
- Session Management - Persistent user sessions
- Auto-login - Remembered login state

📋 Task Management
- Create Tasks - Add new tasks with names, due dates, and file attachments
- View Tasks - Clean list view of all user tasks
- Edit Tasks - Modify existing task details
- Delete Tasks - Remove tasks with confirmation
- File Uploads - Attach files to tasks (stored as base64 in MongoDB)

🔗 RESTful API
- POST /api/record - Create new tasks
- GET /api/record - Retrieve all user tasks
- PUT /api/record - Update tasks
- DELETE /api/record/:task - Delete specific tasks

🛠️ Technology Stack
Backend:
- Node.js & Express.js
- MongoDB with Mongoose
- Passport.js for Facebook OAuth
- Express-formidable for file handling
- EJS templating engine

Frontend:
- EJS templates
- HTML5 & CSS3
- Session-based authentication

Deployment:
- Render (as indicated by callback URL)

🚀 Installation & Setup
Prerequisites
- Node.js
- MongoDB Atlas account
- Facebook Developer account

Steps to Run Locally
1. Clone the repository
   git clone https://github.com/jyoti786J/To-Do-Gp62-S381F.git
   cd To-Do-Gp62-S381F
3. Install dependencies
   npm install
5. Configure environment variables
   Create a .env file with:
   MONGODB_URI=your_mongodb_connection_string
  FACEBOOK_APP_ID=your_facebook_app_id
  FACEBOOK_APP_SECRET=your_facebook_app_secret
  SESSION_SECRET=your_session_secret
7. Run the application
   npm start
9. Access the application
   Main app: http://localhost:8099
   Login page: http://localhost:8099/login

- To-Do-Gp62-S381F/
- ├── server.js              # Main application file
- ├── package.json           # Dependencies and scripts
- ├── views/                 # EJS templates
- │   ├── create.ejs        # Task creation form
- │   ├── list.ejs          # Tasks listing page
- │   ├── edit.ejs          # Task editing form
- │   ├── details.ejs       # Task details view
- │   ├── info.ejs          # Information/status messages
- │   └── login.ejs         # Login page
- └── (other configuration files)

🔧 API Usage Examples

Create a Task
curl -X POST http://localhost:8099/api/record \
  -H "Content-Type: application/json" \
  -d '{"task": "Buy groceries", "date": "2024-12-01"}'

Get All Tasks
curl http://localhost:8099/api/record

Update Tasks
curl -X PUT http://localhost:8099/api/record \
  -H "Content-Type: application/json" \
  -d '{"task": "Updated task", "date": "2024-12-05"}'

Delete a Task
curl -X DELETE http://localhost:8099/api/record/TaskNameToDelete

🔒 Security Features
- Facebook OAuth 2.0 - Secure third-party authentication
- Session-based authentication - Server-side session management
- User isolation - Users can only access their own tasks
- Input validation - Form data validation and sanitization
