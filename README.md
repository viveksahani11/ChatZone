# 💬 ChatZone

![GitHub last commit](https://img.shields.io/github/last-commit/viveksahani11/ChatZone?color=blue&style=flat-square)
![Issues](https://img.shields.io/github/issues/viveksahani11/ChatZone?color=orange&style=flat-square)
![Forks](https://img.shields.io/github/forks/viveksahani11/ChatZone?style=social)
![Stars](https://img.shields.io/github/stars/viveksahani11/ChatZone?style=social)

> A clean, full-stack **real-time chat application** with live messaging, online status, profile picture features, and user-friendly UI. Built with React, Express, Socket.IO, and MongoDB.

🔗 **Live Demo**: [chatzone-12w1.onrender.com](https://chatzone-12w1.onrender.com)

---

## 🔥 Features

- ✅ Realtime 1-on-1 chatting via Socket.IO  
- 🔐 Secure JWT + cookie-based authentication  
- 🟢 Online/Offline status  
- 📤 Upload, View, or Remove profile photo (Cloudinary)  
- 📩 Last message preview in Sidebar + auto sort  
- ✍️ Typing indicator (work in progress)  
- 📱 Fully responsive & minimal UI  
- ⚡ Zustand for frontend global state management  

---

## 🛠️ Tech Stack

**Frontend**:
- React + Vite
- Tailwind CSS
- Zustand
- Axios
- Floating UI
- Lucide Icons

**Backend**:
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT Auth + Cookie Parser
- Cloudinary API
- CORS

---

## 🧩 Folder Structure

ChatZone/
│
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── lib/
│ └── index.js
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── store/
│ │ └── main.jsx
│ └── vite.config.js
│
├── README.md
├── .gitignore
└── package.json (backend)


---

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/viveksahani11/ChatZone.git
cd ChatZone

2. Backend Setup
bash
Copy
Edit
cd backend
npm install
Create .env file in backend/:

env
Copy
Edit
PORT=5000
MONGO_URL=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
3. Frontend Setup
bash
Copy
Edit
cd ../frontend
npm install
npm run build
This will generate the dist/ folder which backend serves in production.

🧪 Local Development
Run backend:

bash
Copy
Edit
cd backend
node index.js
Visit: http://localhost:5000

🌐 Live Demo
Hosted via Render.com

🔗 https://chatzone-12w1.onrender.com

🧠 Contribute
Pull requests are welcome!
Found a bug? Open an issue

🪪 License
This project is licensed under the MIT License

Created with ❤️ by @viveksahani11
