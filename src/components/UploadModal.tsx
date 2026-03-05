import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Table } from 'lucide-react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: any[]) => void;
  title: string;
  templateHeaders: string[];
  description?: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  title, 
  templateHeaders,
  description 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsParsing(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);
        if (results.errors.length > 0) {
          setError('Error parsing CSV file.');
          console.error(results.errors);
        } else {
          setPreviewData(results.data.slice(0, 10)); // Show first 10 rows as preview
        }
      },
      error: (err) => {
        setIsParsing(false);
        setError('Failed to read file.');
        console.error(err);
      }
    });
  };

  const handleConfirm = () => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          onUpload(results.data);
          onClose();
          // Reset state
          setFile(null);
          setPreviewData([]);
        }
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A261C] flex items-center justify-center text-[#D4AF37]">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
                  <p className="text-xs text-slate-500">{description || 'Upload data via CSV file'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Template Guidance */}
              <div className="bg-[#F9F8F4] border border-[#BFBAA8]/30 rounded-xl p-4">
                <h4 className="text-xs font-bold text-[#58594D] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Table size={14} /> CSV Header Requirements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {templateHeaders.map((header, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-[#BFBAA8]/50 rounded-lg text-[10px] font-mono font-bold text-slate-700 shadow-sm">
                      {header}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-3 italic">
                  * Ensure your CSV file has exactly these column names in the first row.
                </p>
              </div>

              {/* Upload Area */}
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFile = e.dataTransfer.files[0];
                    if (droppedFile) processFile(droppedFile);
                  }}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:text-[#D4AF37] transition-all">
                    <FileText size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">Only CSV files are supported</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".csv"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-900">{file.name}</p>
                        <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(2)} KB • Ready to upload</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setFile(null); setPreviewData([]); }}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Preview Table */}
                  {previewData.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Preview (First 10 rows)</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-white border-b border-slate-100">
                            <tr>
                              {Object.keys(previewData[0]).map((key) => (
                                <th key={key} className="px-4 py-2 font-bold text-slate-900 uppercase">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {previewData.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="px-4 py-2 text-slate-600 truncate max-w-[150px]">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              {isParsing && (
                <div className="flex items-center justify-center p-12 gap-3 text-[#D4AF37]">
                  <Loader2 size={24} className="animate-spin" />
                  <p className="text-sm font-bold">Parsing file...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-wide"
              >
                Cancel
              </button>
              <button 
                disabled={!file || isParsing}
                onClick={handleConfirm}
                className="px-8 py-2 rounded-xl text-xs font-bold bg-[#1A261C] text-[#D4AF37] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide shadow-lg shadow-black/10"
              >
                Confirm Upload
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
