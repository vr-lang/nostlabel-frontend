import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ArrowLeft, ArrowRight, Star, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface ImageItem {
  url: string;
  public_id: string;
}

interface UploadingItem {
  id: string;
  name: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface ProductImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images = [],
  onChange,
  maxImages = 10,
}) => {
  const [uploadQueue, setUploadQueue] = useState<UploadingItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file select dialog
  const handleTriggerSelect = () => {
    fileInputRef.current?.click();
  };

  // Upload handler
  const uploadSingleFile = async (item: UploadingItem) => {
    const formData = new FormData();
    formData.append('image', item.file);

    try {
      const res = await apiClient.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadQueue(prev =>
            prev.map(q => (q.id === item.id ? { ...q, progress: pct } : q))
          );
        },
      });

      if (res.data && res.data.success) {
        const newImg: ImageItem = {
          url: res.data.url,
          public_id: res.data.public_id,
        };

        // Append to parent images list
        onChange([...images, newImg]);

        // Remove from upload queue
        setUploadQueue(prev => prev.filter(q => q.id !== item.id));
      } else {
        throw new Error('Upload request failed on server');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      const errMsg = err.response?.data?.message || err.message || 'Connection fault';
      setUploadQueue(prev =>
        prev.map(q => (q.id === item.id ? { ...q, status: 'error', error: errMsg } : q))
      );
    }
  };

  // Add files to upload queue
  const handleFilesAdded = (fileList: FileList) => {
    setErrorMsg(null);
    const files = Array.from(fileList);

    // Validate size and formats
    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg('ONLY JPG, PNG, AND WEBP FORMATS ARE SUPPORTED.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('FILE SIZE MUST BE LESS THAN 10MB.');
        return;
      }
      validFiles.push(file);
    }

    if (images.length + uploadQueue.length + validFiles.length > maxImages) {
      setErrorMsg(`MAXIMUM LIMIT EXCEEDED. YOU CAN ONLY HAVE UP TO ${maxImages} IMAGES.`);
      return;
    }

    const newQueueItems: UploadingItem[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      file,
      progress: 0,
      status: 'uploading',
    }));

    setUploadQueue(prev => [...prev, ...newQueueItems]);

    // Start uploads immediately
    newQueueItems.forEach(item => {
      uploadSingleFile(item);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  // Delete image immediately from Cloudinary
  const handleDeleteImage = async (index: number) => {
    const target = images[index];
    if (!target) return;

    try {
      // Direct deletion call
      await apiClient.delete(`/upload/${target.public_id}`);
      
      // Update form state
      const updated = images.filter((_, idx) => idx !== index);
      onChange(updated);
    } catch (err: any) {
      console.error('Failed to delete image:', err);
      // Remove from frontend state even if backend fails (failsafe for orphans)
      const updated = images.filter((_, idx) => idx !== index);
      onChange(updated);
    }
  };

  // Reorder images
  const handleShiftImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === images.length - 1) return;

    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  // Set as Cover Image (moves to index 0)
  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const copy = [...images];
    const target = copy.splice(index, 1)[0];
    copy.unshift(target);
    onChange(copy);
  };

  // Retry failed upload
  const handleRetryUpload = (item: UploadingItem) => {
    setUploadQueue(prev =>
      prev.map(q => (q.id === item.id ? { ...q, status: 'uploading', progress: 0, error: undefined } : q))
    );
    uploadSingleFile(item);
  };

  // Cancel queue item
  const handleCancelQueueItem = (id: string) => {
    setUploadQueue(prev => prev.filter(q => q.id !== id));
  };

  // Optimized image transformer helper
  const getOptimizedUrl = (url: string) => {
    if (!url.includes('cloudinary.com')) return url;
    // Inject optimization parameters
    return url.replace('/upload/', '/upload/f_auto,q_auto,c_fill,w_300,h_400/');
  };

  return (
    <div className="space-y-6 select-none font-mono text-left text-[10px]">
      
      {/* Upload Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleTriggerSelect}
        className={`border-2 border-dashed rounded-xs p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'border-accent-gold bg-accent-gold/5 animate-pulse' : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-white/5 rounded-full text-white/40">
            <Upload size={16} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-white uppercase font-bold tracking-widest block">
              Drag & Drop Lookbook Sheets
            </span>
            <span className="text-[8.5px] text-white/40 uppercase tracking-wider block">
              Supports JPG, PNG, WEBP. Maximum 10 photos per style.
            </span>
          </div>
        </div>
      </div>

      {/* Error alert */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3 bg-red-500/5 border border-red-500/10 rounded-xs flex items-center space-x-2 text-[9px] text-red-400"
          >
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploading Queue lists */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-white/45 uppercase tracking-widest font-bold block">Uploading Stream ({uploadQueue.length})</span>
          <div className="space-y-2">
            {uploadQueue.map(item => (
              <div 
                key={item.id} 
                className="border border-white/5 bg-white/[0.01] p-3 rounded-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-grow">
                  <div className="flex justify-between text-[8.5px] uppercase text-white/60 font-bold">
                    <span className="truncate max-w-[200px]">{item.name}</span>
                    <span>{item.status === 'error' ? 'FAILED' : `${item.progress}%`}</span>
                  </div>
                  
                  {item.status === 'error' ? (
                    <span className="text-[8px] text-red-400 block uppercase font-bold">{item.error}</span>
                  ) : (
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-gold transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {item.status === 'error' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRetryUpload(item)}
                        className="p-1 bg-white/5 hover:bg-accent-gold hover:text-text-dark border border-white/5 rounded-xs cursor-pointer transition-colors"
                        title="Retry upload"
                      >
                        <RefreshCw size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelQueueItem(item.id)}
                        className="p-1 bg-red-950/10 hover:bg-red-500 hover:text-white border border-red-500/10 rounded-xs cursor-pointer transition-colors"
                        title="Cancel"
                      >
                        <X size={11} />
                      </button>
                    </>
                  ) : (
                    <Loader2 size={12} className="animate-spin text-white/40" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-white/45 uppercase tracking-widest font-bold block">Blueprint Gallery ({images.length})</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <AnimatePresence>
              {images.map((img, idx) => (
                <motion.div
                  key={img.public_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layoutId={img.public_id}
                  className="aspect-[3/4] bg-[#070707] border border-white/10 rounded-xs overflow-hidden relative group"
                >
                  <img 
                    src={getOptimizedUrl(img.url)} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />

                  {/* Primary cover badge */}
                  {idx === 0 ? (
                    <div className="absolute top-2 left-2 bg-accent-gold text-text-dark text-[7px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase flex items-center space-x-1 shadow-md">
                      <Star size={7} fill="currentColor" />
                      <span>Featured</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMakeCover(idx)}
                      className="absolute top-2 left-2 bg-black/60 hover:bg-accent-gold text-white hover:text-text-dark text-[7px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase opacity-0 group-hover:opacity-100 transition-all shadow-md flex items-center space-x-1 cursor-pointer"
                    >
                      <Star size={7} />
                      <span>Set Cover</span>
                    </button>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(idx)}
                      className="p-1.5 bg-red-600/90 text-white rounded-xs hover:bg-red-700 transition-colors self-end cursor-pointer"
                    >
                      <X size={11} />
                    </button>

                    <div className="flex justify-between items-center text-white/80">
                      <button
                        type="button"
                        onClick={() => handleShiftImage(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1 bg-white/10 hover:bg-white/20 rounded-xs disabled:opacity-20 transition-all cursor-pointer"
                      >
                        <ArrowLeft size={10} />
                      </button>
                      <span className="text-[7.5px] font-bold tracking-wider">POS {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleShiftImage(idx, 'right')}
                        disabled={idx === images.length - 1}
                        className="p-1 bg-white/10 hover:bg-white/20 rounded-xs disabled:opacity-20 transition-all cursor-pointer"
                      >
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductImageUploader;
