'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api'; // Your Axios instance

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle Drag & Drop Events
  const validateAndSetFile = useCallback((selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid Image (JPG, PNG) or PDF file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB.');
      return;
    }
    setFile(selectedFile);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, [validateAndSetFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Sending data to Django DRF. 
      // Django will process the AI, save it to DB, and return the new report ID.
      const { data } = await api.post('/api/reports/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // The AI processing is done, and it's saved in the DB!
      // Now redirect the user to the unique page for this report.
      if (data.id) {
        router.push(`/reports/${data.id}`);
      } else {
        throw new Error("Invalid response from server");
      }
      
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError('Analysis failed. Please check your connection and try again.');
      setUploading(false); // Only set to false on error. On success, keep loading until redirect finishes.
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* Back Navigation */}
      <div className="w-full max-w-2xl mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-4xl shadow-sm border border-neutral-200"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-3">Upload Medical Report</h1>
          <p className="text-neutral-500">Secure AI translation pipeline. Results will be saved to your dashboard.</p>
        </div>

        {/* Drag and Drop Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-200 ease-in-out ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
              : file 
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-neutral-300 hover:border-indigo-400 hover:bg-neutral-50'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={uploading}
          />
          
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="upload-prompt"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center space-y-4 pointer-events-none"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center border border-neutral-100 mb-2">
                  <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-neutral-400'}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-neutral-700">
                    <span className="text-indigo-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">JPG, PNG, or PDF (Max 10MB)</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="file-preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center border border-emerald-100 mb-4 text-emerald-600">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-neutral-900 truncate max-w-full px-4">{file.name}</p>
                <p className="text-sm text-emerald-600 font-medium mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

       {/* Selected File Actions & Errors */}
        <AnimatePresence>
          {error && (
            <motion.div 
              key="error-message" /* <-- ADDED KEY HERE */
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-start gap-3 text-sm font-medium overflow-hidden"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {file && !uploading && (
            <motion.div 
              key="action-buttons" /* <-- ADDED KEY HERE */
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 flex gap-3 z-20 relative"
            >
              <button 
                onClick={clearFile}
                className="px-5 py-3.5 rounded-xl font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                className="px-5 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex-2 flex items-center justify-center gap-2"
              >
                Analyze Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploading State */}
        <AnimatePresence>
          {uploading && (
            <motion.div 
              key="uploading-state" /* <-- ADDED KEY HERE */
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center justify-center py-4"
            >
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-neutral-900 font-bold">Processing Medical Data...</p>
              <p className="text-neutral-500 text-sm mt-1 text-center">
                Running Optical Character Recognition and AI Evaluation.<br/>
                Please do not close this window.
              </p>
              
              <div className="w-full max-w-xs h-2 bg-neutral-100 rounded-full mt-5 overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 10, ease: "easeOut" }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}