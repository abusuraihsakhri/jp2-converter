# JP2 Converter
**Developed by Dr. Abu Suraih Sakhri**

A robust, full-stack web application designed to convert JPEG 2000 (`.jp2`) medical and scientific images into high-performance **Pyramidal TIFFs** (OME-TIFF style) or standard **JPEGs**.

## 🚀 Overview

This application uses a decoupled **Client-Server Architecture** to handle large image files efficiently without freezing the user interface. It combines a **React + Vite** frontend with a **FastAPI + Python** backend to deliver a seamless user experience.

---

## 📥 How to Download and Run It Yourself

Follow these simple steps to set up the project on your own machine.

### Prerequisites
- **Git** (to clone the repository)
- **Python 3.9+** (for the backend)
- **Node.js 16+** (for the frontend)

### Step 1: Clone the Repository
Open your terminal (Command Prompt or PowerShell) and run:

```bash
git clone https://github.com/abusuraihsakhri/jp2-converter.git
cd jp2-converter
```

### Step 2: Automatic Setup (Recommended)
We have provided easy-to-use batch scripts for Windows users.

1.  **Start the Backend**:
    Double-click `run_backend.bat` in the project root.
    - This will create a Python virtual environment, install dependencies, and start the server at `http://localhost:8000`.

2.  **Start the Frontend**:
    Double-click `run_frontend.bat` in the project root.
    - This will install Node.js dependencies and launch the UI at `http://localhost:5173`.

### Step 3: Access the Application
Open your browser and navigate to:
**`http://localhost:5173`**

---

## 🛠 Manual Setup (If scripts don't work)

**Backend Setup:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Mac/Linux use: source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ How It Works

### 1. The Frontend (React + Vite)
- **User Interface**: Modern glassmorphism design with dark mode.
- **File Handling**: Drag-and-drop uploads using `react-dropzone`.
- **Communication**: Uploads files to the backend via `axios` and polls for status updates.

### 2. The Backend (FastAPI + Python)
- **API Server**: Runs on `localhost:8000`.
- **Asynchronous Processing**: Handles conversions in background threads to keep the server responsive.
- **Image Processing Engine**:
  - **Decoding**: Uses `imagecodecs` and `Pillow` for robust JP2 support.
  - **Pyramidal TIFF**: Generates multi-resolution OME-TIFF files using `tifffile` and JPEG compression.
  - **JPEG**: Converts to standard high-quality JPEG for web use.

### 3. The Workflow
1.  **Upload**: User drops a `.jp2` file. Frontend sends it to `POST /api/convert`.
2.  **Queue**: Backend processed the file in the background.
3.  **Poll**: Frontend checks status every second.
4.  **Download**: Once complete, a download link is provided.

---

## 👨‍⚕️ Credits
**Concept & Development:** Dr. Abu Suraih Sakhri
**GitHub:** [abusuraihsakhri](https://github.com/abusuraihsakhri)
