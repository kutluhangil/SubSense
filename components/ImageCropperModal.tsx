
import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Check, RotateCw } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImageBase64: string) => void;
  cropShape?: 'circle' | 'rect';
  aspectRatio?: number; // width / height
}

export default function ImageCropperModal({ 
  isOpen, 
  imageSrc, 
  onClose, 
  onCropComplete, 
  cropShape = 'circle',
  aspectRatio = 1 
}: ImageCropperModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize image
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen && imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setImgElement(img);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
    }
  }, [isOpen, imageSrc]);

  useEffect(() => {
    drawCanvas();
  }, [imgElement, scale, position, cropShape, aspectRatio]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imgElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Image
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);
    ctx.restore();

    // Draw Overlay (Darken area outside crop)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);

    // Cut out the crop area
    const cropWidth = Math.min(canvas.width, canvas.height * aspectRatio) * 0.8;
    const cropHeight = cropWidth / aspectRatio;

    if (cropShape === 'circle') {
      ctx.arc(centerX, centerY, cropWidth / 2, 0, Math.PI * 2, true);
    } else {
      ctx.rect(centerX - cropWidth / 2, centerY - cropHeight / 2, cropWidth, cropHeight);
    }
    
    ctx.fill('evenodd'); // Important for the cutout effect

    // Draw Border around crop
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (cropShape === 'circle') {
      ctx.arc(centerX, centerY, cropWidth / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(centerX - cropWidth / 2, centerY - cropHeight / 2, cropWidth, cropHeight);
    }
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    if (!imgElement) return;

    // Create a new canvas for the final cropped image
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    
    // Determine output resolution (higher quality)
    const outputWidth = cropShape === 'circle' ? 400 : 1200;
    const outputHeight = outputWidth / aspectRatio;

    finalCanvas.width = outputWidth;
    finalCanvas.height = outputHeight;

    if (!ctx) return;

    // Calculate source rectangle mapping to the crop area
    const canvas = canvasRef.current;
    if (!canvas) return;

    const previewCropWidth = Math.min(canvas.width, canvas.height * aspectRatio) * 0.8;
    const scaleFactor = outputWidth / previewCropWidth;

    // We need to map the image relative to the center of the crop area
    // The visual center is (canvas.width/2, canvas.height/2)
    // The image center is (canvas.width/2 + position.x, canvas.height/2 + position.y)
    
    const centerX = outputWidth / 2;
    const centerY = outputHeight / 2;

    ctx.save();
    
    // Clip circle if needed
    if (cropShape === 'circle') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, outputWidth / 2, 0, Math.PI * 2);
        ctx.clip();
    }

    ctx.translate(centerX + (position.x * scaleFactor), centerY + (position.y * scaleFactor));
    ctx.scale(scale * scaleFactor, scale * scaleFactor);
    ctx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);
    ctx.restore();

    onCropComplete(finalCanvas.toDataURL('image/jpeg', 0.9));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] max-h-[600px]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h3 className="font-bold text-gray-900">Adjust Image</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 relative bg-gray-900 overflow-hidden cursor-move touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        {/* Footer / Controls */}
        <div className="p-6 bg-white border-t border-gray-100 space-y-4">
           <div className="flex items-center gap-4">
              <ZoomOut size={18} className="text-gray-400" />
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.05" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
              />
              <ZoomIn size={18} className="text-gray-400" />
           </div>

           <div className="flex gap-3 justify-end">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <Check size={18} /> Apply
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
