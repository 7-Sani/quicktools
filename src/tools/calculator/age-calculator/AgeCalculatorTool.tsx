"use client";
import React, { useState } from 'react';

export default function AgeCalculatorTool() {
  const [dob, setDob] = useState<string>('');
  
  const calculateAge = () => {
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (birthDate > today) return { error: "Date of birth cannot be in the future" };
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const timeDiff = today.getTime() - birthDate.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    
    const nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (today > nextBday) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }
    
    const nextBdayDiff = nextBday.getTime() - today.getTime();
    const nextBdayDays = Math.ceil(nextBdayDiff / (1000 * 3600 * 24));
    
    const dayOfWeek = birthDate.toLocaleDateString(undefined, { weekday: 'long' });
    
    return { years, months, days, totalMonths, totalWeeks, totalDays, nextBdayDays, dayOfWeek };
  };

  const result = calculateAge();

  return (
    <div className="space-y-6">
      <div className="neo-card p-6">
        <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Date of Birth</label>
        <input 
          type="date" 
          className="neo-input w-full" 
          value={dob} 
          onChange={(e) => setDob(e.target.value)} 
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {result && !('error' in result) && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="neo-card p-6">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-text-secondary mb-4">Age</h3>
            <div className="text-3xl font-mono font-bold text-accent mb-2">
              {result.years} <span className="text-lg text-text">years</span>
            </div>
            <div className="text-xl font-mono font-bold mb-2">
              {result.months} <span className="text-base text-text-secondary">months</span>
            </div>
            <div className="text-xl font-mono font-bold">
              {result.days} <span className="text-base text-text-secondary">days</span>
            </div>
          </div>
          
          <div className="neo-card p-6">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-text-secondary mb-4">Summary</h3>
            <div className="space-y-2 font-mono">
              <div className="flex justify-between"><span>Total Months:</span> <span className="font-bold">{result.totalMonths.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Total Weeks:</span> <span className="font-bold">{result.totalWeeks.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Total Days:</span> <span className="font-bold">{result.totalDays.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Day of Week Born:</span> <span className="font-bold">{result.dayOfWeek}</span></div>
            </div>
          </div>
          
          <div className="neo-card p-6 md:col-span-2 text-center bg-accent/5 border-accent">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-text-secondary mb-2">Next Birthday In</h3>
            <div className="text-2xl font-mono font-bold text-accent">
              {result.nextBdayDays} <span className="text-lg text-text">days</span>
            </div>
          </div>
        </div>
      )}
      
      {result && 'error' in result && (
        <div className="bg-red-50 border-2 border-red-500 rounded p-4 text-red-700">
          {result.error}
        </div>
      )}
    </div>
  );
}
