import React from 'react';
import { useAuth } from '../context/AuthContext';

const Watermark: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden opacity-[0.03] select-none">
      <div className="absolute inset-0 flex flex-wrap content-start justify-start gap-20 p-10 rotate-[-30deg] scale-150">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-2xl font-bold whitespace-nowrap">
            {user.name} ({user.employeeId}) - CONFIDENTIAL
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watermark;
