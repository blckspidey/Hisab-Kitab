import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, X, Camera, Sparkles, Zap, Eye, Download, DollarSign, Filter, Calendar } from 'lucide-react';
import api from '../api/axios';

const ReceiptsPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [receiptResult, setReceiptResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReceiptResult(null);
      setError('');
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setReceiptResult(null);
        setError('');
        
        // Create preview URL
        const url = URL.createObjectURL(droppedFile);
        setPreviewUrl(url);
      }
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG) or PDF file.');
      return false;
    }
    
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return false;
    }
    
    return true;
  };

  const clearFile = () => {
    setFile(null);
    setReceiptResult(null);
    setError('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    const formData = new FormData();
    formData.append('receipt', file);
    
    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const response = await api.post('/receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadProgress(100);
      setReceiptResult(response.data);
      
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      setTimeout(() => {
      navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" style={{
        backgroundImage: `
          linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
      
      {/* Dynamic Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-lime-400 rounded-2xl transform rotate-12 animate-float opacity-60">
          <div className="w-full h-full border-2 border-lime-400 rounded-xl m-2">
            <div className="w-full h-full border-2 border-lime-400 rounded-lg m-2"></div>
          </div>
        </div>
        <div className="absolute bottom-32 left-16 w-24 h-24 border-2 border-lime-400 rounded-2xl transform -rotate-12 animate-float-delayed opacity-40">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-lime-400 rounded"></div>
            <div className="w-6 h-6 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-4 h-4 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 border-2 border-lime-400 rounded-2xl transform rotate-45 animate-float-slow opacity-30">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-8 border-2 border-lime-400 rounded"></div>
            <div className="w-4 h-6 border-2 border-lime-400 rounded ml-1"></div>
            <div className="w-4 h-4 border-2 border-lime-400 rounded ml-1"></div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 p-8 mb-8 mx-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Camera className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
            Smart Receipt Scanner
          </h1>
          <p className="text-gray-700 dark:text-white/80 text-base sm:text-lg font-medium max-w-3xl mx-auto">
            Upload your receipt and let AI extract the transaction details automatically with precision and style.
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 mx-4">
        {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-cyan-400/10 dark:border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Upload className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Upload Receipt</h2>
          </div>

          {/* Drag & Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-cyan-400 bg-cyan-400/10 scale-105'
                : 'border-cyan-400/30 hover:border-cyan-400/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="relative">
                  {previewUrl && file.type.startsWith('image/') && (
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="mx-auto max-h-48 rounded-2xl shadow-lg"
                    />
                  )}
                  {file.type === 'application/pdf' && (
                    <div className="flex items-center justify-center w-full h-32 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                      <FileText className="w-16 h-16 text-red-500" />
                    </div>
                  )}
                  
                  {/* Remove File Button */}
                  <button
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* File Info */}
                <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-2xl">
                  <p className="font-bold text-gray-800 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    Drop your receipt here
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    or click to browse files
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Supports JPG, PNG, PDF (max 10MB)
                  </p>
                </div>
              </div>
            )}

            <input 
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".jpeg,.jpg,.png,.pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Processing...</span>
                <span className="text-sm font-bold text-purple-600">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI is analyzing your receipt...</span>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="w-full mt-6 px-6 py-4 bg-cyan-400 text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            {uploading ? (
              <>
                <Zap className="w-5 h-5 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload & Extract Data
              </>
            )}
            </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-cyan-400/10 dark:border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center">
              <CheckCircle className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Extracted Data</h2>
          </div>

          {receiptResult ? (
            <div className="space-y-6">
              {/* Success Animation */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-green-600 dark:text-green-400 font-bold text-lg">Receipt Processed Successfully!</p>
              </div>

              {/* Extracted Data Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">Merchant</span>
                  </div>
                  <p className="text-xl font-black text-gray-800 dark:text-white">
                    {receiptResult.extractedData.merchant}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">Amount</span>
                  </div>
<p className="text-2xl font-black text-green-600 dark:text-green-400">
  {receiptResult.extractedData.currency === "USD"
    ? `$${receiptResult.extractedData.amount.toFixed(2)}`
    : receiptResult.extractedData.currency === "INR"
    ? `₹${receiptResult.extractedData.amount.toFixed(2)}`
    : `${receiptResult.extractedData.amount.toFixed(2)} ${receiptResult.extractedData.currency || ""}`}
</p>


                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Filter className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">Category</span>
                  </div>
                  <p className="text-xl font-black text-gray-800 dark:text-white">
                    {receiptResult.extractedData.category}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">Date</span>
                  </div>
                  <p className="text-xl font-black text-gray-800 dark:text-white">
                    {new Date(receiptResult.extractedData.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Receipt Image */}
              {receiptResult.fileUrl && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-5 h-5 text-gray-500" />
                    <span className="font-bold text-gray-700 dark:text-gray-300">Receipt Preview</span>
                  </div>
                  <div className="relative group">
                    <img
                      src={`http://localhost:5001${receiptResult.fileUrl}`}
                      alt="Uploaded Receipt"
                      className="w-full rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors duration-200">
                        <Download className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
                    <p className="font-bold text-green-800 dark:text-green-200">Transaction Created!</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your receipt has been processed and a transaction has been automatically added to your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                Upload a receipt to see the extracted data here
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Our AI will automatically extract merchant, amount, category, and date
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptsPage;