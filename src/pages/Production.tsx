import React, { useState, useEffect } from 'react';
import { Factory, Play, Pause, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import AspectModal from '../components/AspectModal';
import { dbService } from '../services/dbService';
import Swal from 'sweetalert2';

interface ProductionLine {
  id: string;
  lineId: string;
  jobId: string;
  product: string;
  target: string;
  actual: string;
  status: string;
  progress: string;
}

const Production: React.FC = () => {
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    fetchData();
    checkDbStatus();
  }, []);

  const checkDbStatus = async () => {
    const status = await dbService.getStatus();
    setDbConnected(status.connected);
  };

  const fetchData = async () => {
    try {
      const data = await dbService.getProduction();
      if (data && data.length > 0) {
        setLines(data);
      } else {
        // Default mock data if empty
        setLines([
          { id: '1', lineId: 'Line #1', jobId: 'JO-001', product: 'Dining Table A', target: '500', actual: '250', status: 'Running', progress: '50' },
          { id: '2', lineId: 'Line #2', jobId: 'JO-002', product: 'Steel Rack B', target: '300', actual: '120', status: 'Running', progress: '40' },
          { id: '3', lineId: 'Line #3', jobId: 'JO-003', product: 'Office Chair C', target: '1000', actual: '900', status: 'Running', progress: '90' },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch production lines:', error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const line = lines.find(l => l.id === id);
    if (!line) return;

    const updatedLine = { ...line, status: newStatus };
    
    try {
      if (dbConnected) {
        await dbService.saveProduction(updatedLine);
      }
      setLines(prev => prev.map(l => l.id === id ? updatedLine : l));
      Swal.fire({ icon: 'success', title: `Status updated to ${newStatus}`, timer: 1000, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  return (
    <div className="p-8 space-y-8 w-full bg-vistawhite">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-midnight flex items-center justify-center rounded-2xl shadow-lg text-white">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-midnight uppercase tracking-tight">Production Control</h1>
            <p className="text-slate-500 text-sm">Monitor and control active production lines.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-midnight text-white rounded-2xl text-xs font-bold shadow-lg shadow-midnight/20 hover:shadow-xl transition-all uppercase tracking-widest"
        >
          <Info size={18} className="text-fireopal" />
          Environmental Aspects
        </button>
      </header>

      <AspectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Environmental Aspect Details"
      >
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4">Production Line Impacts</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-slate-700">Energy Consumption</span>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded uppercase">High</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-medium text-slate-700">Waste Material</span>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase">Medium</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-slate-700">Water Usage</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase">Low</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1">Carbon Footprint</p>
              <p className="text-2xl font-black text-emerald-900">2.4 <span className="text-xs font-normal">tons/mo</span></p>
            </div>
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider mb-1">Recycling Rate</p>
              <p className="text-2xl font-black text-blue-900">85 <span className="text-xs font-normal">%</span></p>
            </div>
          </div>
        </div>
      </AspectModal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lines.map((line) => (
          <div key={line.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-midnight uppercase tracking-widest text-xs">{line.lineId}</h3>
              <span className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${line.status === 'Running' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-fireopal bg-rose-50 border border-rose-100'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${line.status === 'Running' ? 'bg-emerald-500 animate-pulse' : 'bg-fireopal'}`} />
                {line.status}
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-fireopal uppercase tracking-widest">{line.jobId}</p>
                <h4 className="text-sm font-black text-midnight uppercase tracking-tight">{line.product}</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Progress</span>
                  <span className="text-midnight">{line.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-fireopal transition-all duration-1000" 
                    style={{ width: `${line.progress}%` }} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Target</p>
                  <p className="text-lg font-black text-midnight font-mono">{line.target}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Actual</p>
                  <p className="text-lg font-black text-midnight font-mono">{line.actual}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {line.status === 'Running' ? (
                  <button 
                    onClick={() => updateStatus(line.id, 'Paused')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-midnight text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                ) : (
                  <button 
                    onClick={() => updateStatus(line.id, 'Running')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-fireopal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fireopal/90 transition-all shadow-md shadow-fireopal/20"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                )}
                <button 
                  onClick={() => updateStatus(line.id, 'Finished')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Production;
