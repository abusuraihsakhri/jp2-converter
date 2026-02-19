# JP2 Converter
**Developed by Dr. Abu Suraih Sakhri**

A robust, full-stack web application designed to convert JPEG 2000 (`.jp2`) medical and scientific images into high-performance **Pyramidal TIFFs** (OME-TIFF style) or standard **JPEGs**.

## 🚀 How It Works

This application uses a decoupled **Client-Server Architecture** to handle large image files efficiently without freezing the user interface.

### 1. The Frontend (React + Vite)
- **User Interface**: Built with React, featuring a modern glassmorphism design and dark mode.
- **File Handling**: Uses `react-dropzone` for drag-and-drop functionality.
- **Communication**: When a file is uploaded, it is sent to the backend API via `axios`.
- **Status Polling**: The frontend constantly asks the backend, *"Is task X done yet?"* every second. This allows the user to see real-time progress updates without needing a persistent socket connection.

### 2. The Backend (FastAPI + Python)
- **API Server**: A high-performance FastAPI server running on `localhost:8000`.
- **Asynchronous Processing**:
  - When a file is received, the server assigns it a unique **Task ID (UUID)**.
  - The heavy conversion job is sent to a **Background Task** so the server remains responsive to other requests.
- **Image Processing Engine**:
  - **Decoding**: Uses `imagecodecs` and `Pillow` to read complex JP2 data streams.
  - **Pyramidal TIFF Generation**:
    - The image is loaded into a NumPy array.
    - It is iteratively downsampled (halved in size) to create multiple resolution "levels" (full size, 50%, 25%, etc.).
    - These levels are written into a single TIFF file using `tifffile` with JPEG compression and tile storage. This format is critical for Deep Zoom viewers (like OpenSeadragon).
  - **JPEG Conversion**:
    - The image is converted to RGB (if necessary) and saved as a high-quality standard JPEG for web viewing.

### 3. The Workflow
1.  **Upload**: User drops a `.jp2` file. Frontend sends it to `POST /api/convert`.
2.  **Queue**: Backend saves the file temporarily, creates a Task ID, and starts the background worker.
3.  **Process**:
    - The Python script reads the JP2.
    - If "Pyramidal TIFF" is selected, it generates the multi-resolution pyramid.
    - If "JPEG" is selected, it optimizes the image for web.
4.  **Poll**: Frontend hits `GET /api/status/{task_id}` until the status is `"completed"`.
5.  **Download**: Frontend displays a download button linking to `GET /api/download/{task_id}`.

---

## 🛠 Project Structure

```
jp2_converter/
├── backend/                # Python FastAPI Server
│   ├── main.py             # API Endpoints & Task Management
│   ├── converter.py        # Core Image Processing Logic
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/            # Temp storage for inputs
│   └── outputs/            # Temp storage for converted files
├── frontend/               # React Application
│   ├── src/                # Source code (App.jsx, index.css)
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── README.md               # Documentation
```

## 📦 Installation & Setup

### Prerequisites
- **Python 3.9+**
- **Node.js 16+**

### Quick Start (Windows)
1.  **Start Backend**: Double-click `run_backend.bat`.
    - This sets up the Python virtual environment and starts the API.
2.  **Start Frontend**: Double-click `run_frontend.bat`.
    - This installs Node modules and launches the UI.
3.  **Access App**: Open `http://localhost:5173`.

### Manual Setup
**Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 👨‍⚕️ Credits
**Concept & Development:** Dr. Abu Suraih Sakhri
