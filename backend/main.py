from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uuid
import os
import asyncio
from typing import Dict, Optional
try:
    from backend.converter import convert_jp2_to_pyramidal_tiff, convert_jp2_to_jpeg, Image
except ImportError:
    from converter import convert_jp2_to_pyramidal_tiff, convert_jp2_to_jpeg, Image

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for tasks
tasks: Dict[str, Dict] = {}
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def process_conversion(task_id: str, input_path: str, format_type: str):
    try:
        tasks[task_id]["status"] = "processing"
        
        output_filename = f"{task_id}.{format_type}"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        if format_type == "tiff" or format_type == "tif":
             convert_jp2_to_pyramidal_tiff(input_path, output_path)
             tasks[task_id]["result_file"] = output_filename
             tasks[task_id]["status"] = "completed"
             
        elif format_type == "jpeg" or format_type == "jpg":
             convert_jp2_to_jpeg(input_path, output_path)
             tasks[task_id]["result_file"] = output_filename
             tasks[task_id]["status"] = "completed"
        
        else:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = "Unsupported format"
            
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
    finally:
        # Cleanup input file
        if os.path.exists(input_path):
            os.remove(input_path)


@app.post("/api/convert")
async def convert_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = "tiff"
):
    if not file.filename.lower().endswith(('.jp2', '.j2k', '.jpf')):
        return JSONResponse(status_code=400, content={"message": "Invalid file type. Only JP2 files are supported."})

    task_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{task_id}_{file.filename}")
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    tasks[task_id] = {
        "status": "pending",
        "filename": file.filename,
        "target_format": format
    }
    
    background_tasks.add_task(process_conversion, task_id, input_path, format)
    
    return {"task_id": task_id, "status": "pending"}

@app.get("/api/status/{task_id}")
async def get_status(task_id: str):
    task = tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.get("/api/download/{task_id}")
async def download_image(task_id: str):
    task = tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Conversion not finished")
        
    file_path = os.path.join(OUTPUT_DIR, task["result_file"])
    return FileResponse(file_path, filename=f"converted_{task['result_file']}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
