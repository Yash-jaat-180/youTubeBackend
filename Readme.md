# 🎬 TubeFree Backend

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-blue?style=for-the-badge&logo=jsonwebtokens)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-blue?style=for-the-badge&logo=cloudinary)

A production-ready REST API for a modern video-sharing platform inspired by YouTube and social networking applications.

Built with **Node.js, Express.js, MongoDB, JWT Authentication, Cloudinary, and Mongoose**.

</div>

---

# 📖 Overview

TubeFree Backend is a scalable backend service that powers a video-sharing platform where users can:

- Create and manage accounts
- Upload videos
- Like and comment on content
- Subscribe to creators
- Manage playlists
- Post tweets/community updates
- Track watch history
- Access creator analytics

The project follows industry-standard backend architecture practices with proper authentication, authorization, middleware handling, and database design.

---

# ✨ Features

## 👤 Authentication & User Management

- User Registration
- User Login
- Secure JWT Authentication
- Refresh Token Mechanism
- Logout Functionality
- Password Encryption using bcrypt
- Profile Management
- Avatar Upload
- Cover Image Upload
- Change Password

---

## 🎥 Video Management

- Upload Videos
- Update Video Details
- Delete Videos
- Publish/Unpublish Videos
- View Count Tracking
- Fetch User Videos
- Fetch Single Video
- Video Search Support

---

## ❤️ Likes System

Users can:

- Like Videos
- Unlike Videos
- Like Comments
- Unlike Comments
- Like Tweets
- Unlike Tweets

---

## 💬 Comment System

- Add Comments
- Update Comments
- Delete Comments
- Retrieve Video Comments
- Pagination Support

---

## 📂 Playlist Management

- Create Playlists
- Update Playlists
- Delete Playlists
- Add Videos to Playlist
- Remove Videos from Playlist
- View Playlist Videos

---

## 🔔 Subscription System

- Subscribe to Channels
- Unsubscribe from Channels
- Get Subscriber Count
- Get Subscribed Channels

---

## 🐦 Tweet Module

- Create Tweet
- Update Tweet
- Delete Tweet
- View User Tweets

---

## 📊 Dashboard & Analytics

Creator dashboard includes:

- Total Videos
- Total Views
- Total Subscribers
- Channel Statistics
- Uploaded Content Analytics

---

## ☁️ Media Storage

Integrated with Cloudinary for:

- Video Uploads
- Avatar Storage
- Cover Image Storage
- Media Optimization

---

# 🏗️ System Architecture

```text
Client Application
        │
        ▼
    API Routes
        │
        ▼
   Controllers
        │
        ▼
Business Logic
        │
        ▼
 Mongoose Models
        │
        ▼
    MongoDB
```

---

# 🛠️ Tech Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose ODM

## Authentication

- JWT (Access Token)
- JWT (Refresh Token)
- bcrypt

## File Handling

- Multer
- Cloudinary

## Middleware

- Cookie Parser
- CORS
- Express Middleware

## Development Tools

- Nodemon
- dotenv

---

# 📂 Project Structure

```bash
src
│
├── controllers
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── playlist.controller.js
│   ├── subscription.controller.js
│   ├── tweet.controller.js
│   └── dashboard.controller.js
│
├── models
│   ├── user.model.js
│   ├── video.model.js
│   ├── comment.model.js
│   ├── like.model.js
│   ├── playlist.model.js
│   ├── subscription.model.js
│   └── tweet.model.js
│
├── routes
│
├── middlewares
│
├── utils
│
├── db
│
├── app.js
├── index.js
└── constants.js
```

---

# 🔐 Environment Variables

Create a `.env` file in the root directory.

```env
PORT=8000

MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CORS_ORIGIN=http://localhost:5173
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/tubefree-backend.git
```

## Navigate to Project

```bash
cd tubefree-backend
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create `.env` file and add required credentials.

## Start Development Server

```bash
npm run dev
```

## Start Production Server

```bash
npm start
```

---

# 🚀 API Modules

| Module | Status |
|----------|----------|
| Authentication | ✅ |
| Users | ✅ |
| Videos | ✅ |
| Comments | ✅ |
| Likes | ✅ |
| Playlists | ✅ |
| Subscriptions | ✅ |
| Tweets | ✅ |
| Dashboard | ✅ |
| Health Check | ✅ |

---

# 🔑 Authentication Flow

```text
User Login
      │
      ▼
Access Token Generated
      │
      ▼
Refresh Token Generated
      │
      ▼
Stored in Cookies
      │
      ▼
Protected Routes Access
```

---

# 🗄️ Database Models

The application contains the following major collections:

### User

Stores:

- Username
- Email
- Password
- Avatar
- Cover Image
- Watch History

### Video

Stores:

- Video File
- Thumbnail
- Title
- Description
- Views
- Owner

### Comment

Stores:

- Comment Content
- Video Reference
- User Reference

### Playlist

Stores:

- Playlist Details
- Video References
- Owner

### Subscription

Stores:

- Subscriber
- Channel

### Tweet

Stores:

- Content
- Owner

### Like

Stores:

- User Reference
- Target Content Reference

---

# 🧪 API Testing

Recommended Tools:

- Postman
- Thunder Client
- Insomnia

---

# 📈 Future Enhancements

- Live Streaming
- Video Recommendations
- Real-Time Notifications
- AI Search
- Watch Together Feature
- Video Processing Queue
- Advanced Analytics

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the repository and submit a pull request.

---

# 👨‍💻 Author

### Yash Saharan

Computer Science Student | MERN Stack Developer | Backend Enthusiast

---

# ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the repository

🛠️ Contribute to the project

---

<div align="center">

Made with ❤️ using Node.js, Express.js and MongoDB

</div>
