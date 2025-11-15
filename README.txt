# UniConnect – Real-Time Classroom & Meeting Platform

UniConnect is a **real-time classroom and virtual meeting platform** inspired by Google Meet and Google Classroom.  
It allows users to join dynamic rooms, stream video/audio, chat, and collaborate in real-time. This project is designed for online classes, meetings, and collaborative environments in universities or organizations.

---

## **Features**

### Real-Time Communication
- WebRTC-based video & audio streaming
- Automatic peer-to-peer connections
- Real-time signaling via Socket.io
- Auto-detection of participants joining/leaving
- Optimized for low-latency media streaming

### Room Management
- Create or join rooms with custom Room IDs
- Track active participants in each room
- Notify users when new participants join
- Automatically remove users when they disconnect

### Local Media Handling
- Automatic camera and microphone access
- Live preview of your own stream
- Device permission checks

### User Interface
- Clean and minimal UI for meetings
- Input field for entering room codes
- Responsive layout for desktop and mobile
- Lightweight design with custom CSS

### Chat & Collaboration
- Real-time text chat
- Emojis & reactions (planned)
- File sharing (planned)
- Whiteboard collaboration mode (planned)

### Authentication & Roles (Future)
- Student/Teacher roles
- Login via email/password or Google OAuth
- Host controls for meetings

---

## **Tech Stack**

### Frontend
- React + TypeScript
- Vite (build tool)
- Socket.io-client
- WebRTC (browser-native)
- Custom CSS (Tailwind optional)

### Backend
- Node.js + Express
- Socket.io (signaling server)
- dotenv (environment variables)
- CORS support for cross-origin requests

---


## **Setup & Installation**

### **Backend**

1. Go to the server folder:
```bash
cd server

npm install

PORT=4000

node server.js
# or nodemon server.js if you have nodemon installed

1. Go to the client folder:
```bash
cd client

npm install

npm run dev

---

I can also make a **more visual, GitHub-friendly README** with **screenshots, GIFs, and badges**, which makes it look very professional for your university project repo.  

Do you want me to do that next?