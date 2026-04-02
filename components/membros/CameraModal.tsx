'use client';

import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, Upload, RotateCcw, Check } from 'lucide-react';

interface CameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const webcamRef = useRef<Webcam>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');

  const capture = useCallback(() => {
    const img = webcamRef.current?.getScreenshot();
    if (img) setCaptured(img);
  }, [webcamRef]);

  function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  function handleConfirm() {
    if (!captured) return;
    const file = dataURLtoFile(captured, `foto_${Date.now()}.jpg`);
    onCapture(file);
    onClose();
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { onCapture(file); onClose(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Foto do Membro</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Tab */}
        <div className="flex border-b border-slate-100">
          {(['camera', 'upload'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setCaptured(null); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === m ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {m === 'camera' ? '📷 Câmera' : '📁 Upload'}
            </button>
          ))}
        </div>

        <div className="p-4">
          {mode === 'camera' ? (
            <div className="space-y-3">
              {!captured ? (
                <>
                  <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video">
                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                      videoConstraints={{ facingMode: 'user' }} />
                  </div>
                  <button onClick={capture}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors">
                    <Camera className="w-4 h-4" /> Tirar Foto
                  </button>
                </>
              ) : (
                <>
                  <img src={captured} alt="preview" className="w-full rounded-xl aspect-video object-cover" />
                  <div className="flex gap-2">
                    <button onClick={() => setCaptured(null)}
                      className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium">
                      <RotateCcw className="w-4 h-4" /> Repetir
                    </button>
                    <button onClick={handleConfirm}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl transition-colors text-sm font-medium">
                      <Check className="w-4 h-4" /> Usar Foto
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl py-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-500">Clique para selecionar uma imagem</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
