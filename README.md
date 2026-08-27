# 🤖 PulseBot

### Full-Stack Real-Time AI Companion Web Platform

PulseBot is a full-stack conversational AI web application built with **Node.js, Express, EJS, MongoDB, Redis, and Groq AI**.

It provides real-time AI chat with **Server-Sent Events (SSE)** token streaming, persistent multi-turn conversations, Redis-backed conversation caching, JWT authentication, user profile management, and a cinematic dark-themed interface.

> 🌐 **Live Demo:** https://pulsebot-7x38.onrender.com
>
> 📦 **Repository:** https://github.com/RaghavAlag/PulseBot

---

## ✨ Features

### 🎬 Cinematic Landing Experience
- Interactive cyberpunk-inspired landing scene
- Responsive master-scene scaling
- Live digital clock
- Ambient monitor video
- Interactive monitor hotspot
- Camera zoom transition into the application
- Access Denied feedback for non-interactive areas
- Animated cinematic reveal screen

### 🔐 Authentication & User Management
- User registration and login
- Server-side email validation
- Email normalization
- Password hashing using bcrypt
- JWT-based authentication
- HTTP-only authentication cookies
- Secure cookies in production
- Login rate limiting
- Profile name updates
- Password change with current-password verification
- Permanent account deletion
- Cascade deletion of associated conversations

### 🤖 Real-Time AI Chat
- Groq-powered AI conversations
- `openai/gpt-oss-20b` model
- OpenAI-compatible SDK integration
- Real-time token streaming using Server-Sent Events (SSE)
- Multi-turn conversation context
- Automatic conversation persistence
- AI request rate limiting
- Prompt validation and length limits
- Markdown rendering
- Code blocks and tables
- XSS protection using DOMPurify

### 💬 Conversation Management
- Persistent chat history
- Automatic conversation titles
- Conversation pagination
- Load More functionality
- Conversation renaming
- Conversation deletion
- Direct conversation loading
- Redis-backed caching
- Automatic cache invalidation
- MongoDB fallback when Redis is unavailable
- Strict user-level conversation ownership

### 🛡️ Security
- JWT authentication
- HTTP-only cookies
- `SameSite: Lax`
- Secure cookies in production
- bcrypt password hashing
- Login rate limiting
- AI request rate limiting
- Server-side input validation
- DOMPurify XSS sanitization
- User ownership checks to prevent cross-user conversation access
- Environment-based secret management

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │     User Browser    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express Server    │
                         │     (Node.js)       │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌──────────────┐       ┌─────────────┐
      │    Auth     │       │     Chat     │       │   Profile   │
      │ JWT + bcrypt│       │    Routes    │       │   Routes    │
      └──────┬──────┘       └──────┬───────┘       └──────┬──────┘
             │                     │                      │
             ▼                     ▼                      ▼
      ┌─────────────┐       ┌──────────────┐       ┌─────────────┐
      │  MongoDB    │◄──────│    Redis     │       │  MongoDB    │
      │    Atlas    │       │    Cache     │       │    Atlas     │
      └─────────────┘       └──────────────┘       └─────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │    Groq API     │
                           │ GPT-OSS-20B     │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │   SSE Stream    │
                           │ Token-by-Token  │
                           └─────────────────┘
```

---

## 🔄 Application Flow

### 1. Landing Page
Users enter through the interactive cinematic landing experience. The main monitor acts as the entry point into the application and triggers a visual transition into PulseBot.

### 2. Authentication
Users can create an account or log in.

```text
User Credentials
       ↓
Validation
       ↓
bcrypt
       ↓
MongoDB
       ↓
JWT
       ↓
HTTP-only Cookie
```

### 3. Chat
Authenticated users enter the chat dashboard and can either select a starter suggestion or enter a custom prompt.

### 4. AI Streaming
PulseBot communicates with Groq through its OpenAI-compatible API. Instead of waiting for the complete response, the server streams generated text progressively to the browser using SSE.

```text
Groq
  ↓
AI Token Delta
  ↓
Express SSE
  ↓
Browser
  ↓
Live Markdown Rendering
```

### 5. Conversation Persistence
After the AI response completes, the conversation is persisted in MongoDB. Redis caches conversation lists to reduce repeated database queries. If Redis becomes unavailable, PulseBot falls back to MongoDB.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Runtime | Node.js | Server-side JavaScript runtime |
| Backend | Express.js 5.2.1 | HTTP server and routing |
| Templating | EJS 6.0.1 | Server-side HTML rendering |
| Frontend | HTML5 | Application structure |
| Frontend | Vanilla JavaScript ES6+ | Client-side interactions |
| Styling | Custom CSS3 | Cinematic UI and responsive layouts |
| Database | MongoDB | Persistent application data |
| ODM | Mongoose 9.9.1 | MongoDB schemas and queries |
| Cache | Redis 6.2.1 | Conversation list caching |
| AI | Groq API | LLM inference |
| AI Model | `openai/gpt-oss-20b` | Conversational AI |
| AI SDK | OpenAI SDK 7.4.0 | Groq-compatible API client |
| Streaming | Server-Sent Events | Real-time AI response streaming |
| Authentication | JSON Web Tokens | Stateless authentication |
| Password Security | bcrypt 6.0.0 | Password hashing |
| Rate Limiting | express-rate-limit 8.6.2 | Abuse and brute-force protection |
| Markdown | Marked.js | AI response rendering |
| XSS Protection | DOMPurify | HTML sanitization |
| Cookies | cookie-parser | Cookie handling |
| Configuration | dotenv | Local environment configuration |
| Deployment | Render | Production hosting |

---

## 🗄️ Database

PulseBot uses **MongoDB** as its primary persistent database.

### User Model

```text
User
├── name
├── email
└── password
```

Passwords are stored as bcrypt hashes rather than plaintext.

### Conversation Model

```text
Conversation
├── userId
├── title
├── messages[]
│   ├── role
│   └── content
├── createdAt
└── updatedAt
```

The conversation collection uses a compound index:

```text
{ userId: 1, createdAt: -1 }
```

This supports efficient user-specific conversation history queries.

---

## 🔴 Redis Caching

Redis is used as a caching layer for paginated conversation lists.

### Cache Key

```text
conversations:<userId>:page:<page>:limit:<limit>
```

### Cache TTL

```text
300 seconds
```

### Cache Flow

```text
Request
   ↓
Redis
   ├── Cache Hit → Return cached conversations
   │
   └── Cache Miss
          ↓
       MongoDB
          ↓
       Redis SET
          ↓
       Return Data
```

When conversations are created, renamed, or deleted, related cache entries are invalidated.

PulseBot also includes a safe Redis wrapper that allows the application to fall back to MongoDB when Redis is unavailable.

---

## 🤖 AI Integration

PulseBot uses the **Groq API** through its OpenAI-compatible endpoint.

```text
Provider: Groq
Model: openai/gpt-oss-20b
Protocol: Server-Sent Events
```

Previous conversation messages are passed alongside the new user message to preserve multi-turn context.

The server streams generated text to the browser through SSE.

---

## 🔐 Authentication & Security

### Password Hashing
Passwords are hashed using:

```text
bcrypt
10 salt rounds
```

### JWT Authentication
JWT tokens contain the authenticated user's ID and expire after one day.

### Cookie Security

```text
httpOnly: true
sameSite: "lax"
secure: true in production
```

### Rate Limiting

Login:

```text
5 requests / 15 minutes
```

AI generation:

```text
10 requests / minute
```

### Input Validation
The application validates limits for:
- Email
- Password
- User name
- Chat messages
- Conversation titles

### XSS Protection
AI-generated Markdown is parsed with Marked.js and sanitized through DOMPurify before being inserted into the DOM.

### Conversation Ownership

```text
{ _id: conversationId, userId: req.userId }
```

This prevents users from accessing another user's conversations by manipulating conversation IDs.

---

## 📡 API Reference

### Public Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Landing page |
| GET | `/login` | Login page |
| GET | `/signup` | Signup page |

### Authentication & User Routes

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/user/signUp` | No |
| POST | `/user/login` | No |
| GET | `/user/logout` | No |
| GET | `/user/profile` | Yes |
| POST | `/user/profile/update` | Yes |
| POST | `/user/profile/password` | Yes |
| POST | `/user/profile/delete` | Yes |

### Chat & Conversation Routes

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/homepage` | Yes |
| POST | `/homepage/askingai` | Yes |
| GET | `/homepage/conversation` | Yes |
| GET | `/homepage/conversation/:id` | Yes |
| POST | `/homepage/conversation/rename/:id` | Yes |
| POST | `/homepage/conversation/delete/:id` | Yes |

The AI endpoint returns a streaming SSE response with:

```text
Content-Type: text/event-stream
```

---

## 📁 Project Structure

```text
PulseBot/
│
├── ai/
│   └── chat.js
│
├── controllers/
│   ├── askingai.js
│   ├── conversation.js
│   ├── deleteconversation.js
│   ├── renameconversation.js
│   ├── showchat.js
│   └── user.js
│
├── middleware/
│   └── auth.js
│
├── models/
│   ├── conversation.js
│   └── user.js
│
├── public/
│   ├── assets/
│   │   ├── ambient-driving.mp4
│   │   └── landing-wide.png
│   ├── auth.css
│   ├── chat.css
│   ├── landing.css
│   ├── landingpage.js
│   └── profile.css
│
├── routes/
│   ├── homepage.js
│   ├── static_route.js
│   └── userSignUp.js
│
├── utils/
│   └── safeRedis.js
│
├── views/
│   ├── chat.ejs
│   ├── landingpage.ejs
│   ├── login.ejs
│   └── profile.ejs
│
├── .gitignore
├── connection.js
├── index.js
├── package-lock.json
├── package.json
└── redis.js
```

---

## ⚙️ Environment Variables

Create a `.env` file locally:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
REDIS_URL=your_redis_connection_url
NODE_ENV=development
```

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Server port; defaults to `3000` locally |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing and verification secret |
| `GROQ_API_KEY` | Yes | Groq API authentication |
| `REDIS_URL` | No | Redis connection URL |
| `NODE_ENV` | No | Controls production cookie security |

> ⚠️ Never commit actual secrets, API keys, passwords, or connection strings to GitHub.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/RaghavAlag/PulseBot.git
cd PulseBot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add the required variables.

### 4. Start the Application

```bash
npm start
```

The application uses the configured `PORT` and falls back to:

```text
3000
```

---

## ☁️ Deployment

PulseBot is deployed using **Render**.

### Production Architecture

```text
GitHub
   ↓
Render Web Service
   ↓
Express / Node.js
   ├── MongoDB Atlas
   ├── Render Key Value / Redis
   └── Groq API
```

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

### Production Environment

```text
NODE_ENV=production
```

The server dynamically uses Render's provided port:

```javascript
process.env.PORT || 3000
```

### Production Services

- **Application:** Render Web Service
- **Database:** MongoDB Atlas
- **Cache:** Render Key Value / Redis
- **AI:** Groq API

---

## 🧪 Current Project Status

### ✅ Implemented

- Real-time AI streaming
- Persistent multi-turn conversations
- MongoDB persistence
- Redis caching
- Redis fallback
- JWT authentication
- Secure cookies
- Password hashing
- Rate limiting
- XSS sanitization
- Conversation ownership protection
- Profile management
- Account deletion
- Responsive cinematic UI
- Production deployment on Render

### ⚠️ Not Currently Implemented

- Social OAuth authentication
- File/image chat attachments
- Role-based admin hierarchy
- Automated unit/integration test suite
- Light mode

---

## 🔮 Future Improvements

Potential future improvements include:

- Google/GitHub OAuth
- File and image attachments
- Automated unit and integration testing
- Admin/role-based access control
- Additional AI model selection
- Advanced conversation search
- Custom domain
- Additional observability and production monitoring

---

## 📌 Engineering Highlights

### Real-Time User Experience
SSE allows AI output to appear progressively instead of waiting for the complete generation.

### Persistent Context
Conversations are stored in MongoDB so users can return to previous chats.

### Reduced Database Load
Redis caches frequently requested conversation lists.

### Resilient Caching
The application can fall back to MongoDB if Redis is unavailable.

### User-Level Data Isolation
Conversation operations enforce ownership checks using the authenticated user's ID.

### Secure AI Rendering
AI-generated Markdown is sanitized before being inserted into the page.

---

## 🌐 Live Demo

**Try PulseBot:**

https://pulsebot-7x38.onrender.com

---

## 👨‍💻 Author

**Raghav Alag**

GitHub: https://github.com/RaghavAlag

---

## 📄 License

This project currently does not specify a license.
