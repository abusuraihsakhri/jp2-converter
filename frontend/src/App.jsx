import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle, Download, AlertCircle, RefreshCw, FileImage, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import './App.css'

const API_URL = 'http://localhost:8000/api'

function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle, uploading, processing, completed, error
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [taskId, setTaskId] = useState(null)
  const [error, setError] = useState(null)
  const [conversionType, setConversionType] = useState('tiff') // tiff or jpeg

  // Polling effect
  useEffect(() => {
    let intervalId
    if (status === 'processing' && taskId) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/status/${taskId}`)
          const taskStatus = response.data.status

          if (taskStatus === 'completed') {
            setStatus('completed')
            setProgress(100)
            setResult({
              url: `${API_URL}/download/${taskId}`,
              filename: response.data.result_file
            })
          } else if (taskStatus === 'failed') {
            setStatus('error')
            setError(response.data.error || 'Conversion failed')
          }
        } catch (e) {
          console.error("Polling error", e)
          // Don't stop polling on transient network errors unless persistent
        }
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [status, taskId])

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles?.length) {
      setFile(acceptedFiles[0])
      setStatus('idle')
      setResult(null)
      setError(null)
      setProgress(0)
      setTaskId(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jp2': ['.jp2', '.j2k', '.jpf'],
      'application/octet-stream': ['.jp2']
    },
    multiple: false
  })

  const handleConvert = async () => {
    if (!file) return

    setStatus('uploading')
    setProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/convert`, formData, {
        params: { format: conversionType },
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 50) / progressEvent.total)
          setProgress(percent)
        }
      })

      setTaskId(response.data.task_id)
      setStatus('processing')
      setProgress(50) // processing start

    } catch (e) {
      console.error(e)
      setStatus('error')
      setError(e.response?.data?.message || 'Upload failed. Is the backend running?')
      setProgress(0)
    }
  }

  const reset = () => {
    setFile(null)
    setStatus('idle')
    setResult(null)
    setTaskId(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>JP2 Converter</h1>
        <p>Transform JPEG 2000 images into Pyramidal TIFF or Standard JPEG</p>
      </header>

      <div className="main-content">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
              <input {...getInputProps()} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Upload size={48} color={isDragActive ? '#6366f1' : '#94a3b8'} />
                {isDragActive ? (
                  <p>Drop the JP2 file here...</p>
                ) : (
                  <div>
                    <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      Drag & Drop JP2 file here
                    </p>
                    <p>or click to select file</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="preview-area"
            >
              <div className="file-info-card" style={{
                background: 'var(--bg-tertiary)',
                padding: '1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <FileImage size={40} color="#6366f1" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{file.name}</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {status !== 'processing' && status !== 'uploading' && (
                  <button
                    onClick={reset}
                    style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.5rem' }}
                    title="Remove file"
                  >
                    ✕
                  </button>
                )}
              </div>

              {status === 'idle' && (
                <div className="options-area" style={{ marginTop: '1rem' }}>
                  <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Select Output Format:</p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => setConversionType('tiff')}
                      style={{
                        borderColor: conversionType === 'tiff' ? 'var(--accent-color)' : 'transparent',
                        background: conversionType === 'tiff' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                        color: conversionType === 'tiff' ? 'var(--accent-color)' : 'var(--text-secondary)'
                      }}
                    >
                      <ImageIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                      Pyramidal TIFF
                    </button>
                    <button
                      onClick={() => setConversionType('jpeg')}
                      style={{
                        borderColor: conversionType === 'jpeg' ? 'var(--accent-color)' : 'transparent',
                        background: conversionType === 'jpeg' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                        color: conversionType === 'jpeg' ? 'var(--accent-color)' : 'var(--text-secondary)'
                      }}
                    >
                      <ImageIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                      Standard JPEG
                    </button>
                  </div>

                  <div className="action-bar">
                    <button
                      className="btn-primary"
                      onClick={handleConvert}
                      style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}
                    >
                      Process Conversion
                    </button>
                  </div>
                </div>
              )}

              {(status === 'uploading' || status === 'processing') && (
                <div className="progress-section" style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{status === 'uploading' ? 'Uploading...' : 'Processing...'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  {status === 'processing' && (
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Generating {conversionType === 'tiff' ? 'pyramidal levels' : 'optimization'}... This might take a moment.
                    </p>
                  )}
                </div>
              )}

              {status === 'completed' && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="success-area"
                  style={{ marginTop: '2rem', textAlign: 'center' }}
                >
                  <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Conversion Complete!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Your file is ready for download.
                  </p>

                  <a href={result.url} className="btn-primary" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px'
                  }}>
                    <Download size={20} />
                    Download {conversionType.toUpperCase()}
                  </a>

                  <button
                    onClick={reset}
                    style={{
                      marginTop: '1.5rem',
                      display: 'block',
                      margin: '1.5rem auto 0',
                      background: 'transparent',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Convert another file
                  </button>
                </motion.div>
              )}

              {status === 'error' && (
                <div className="error-area" style={{ marginTop: '2rem', color: '#ef4444' }}>
                  <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
                  <h3>Conversion Failed</h3>
                  <p>{error}</p>
                  <button onClick={reset} style={{ marginTop: '1rem' }}>Try Again</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer style={{ marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>Developed by Dr. Abu Suraih Sakhri</p>
      </footer>
    </div>
  )
}

export default App
