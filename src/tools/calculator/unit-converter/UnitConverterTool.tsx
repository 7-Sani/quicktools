"use client";
import React, { useState, useEffect } from 'react';

const unitData: Record<string, Record<string, number>> = {
  Length: {
    'mm': 0.001, 'cm': 0.01, 'm': 1, 'km': 1000, 
    'inch': 0.0254, 'foot': 0.3048, 'yard': 0.9144, 'mile': 1609.34
  },
  Weight: {
    'mg': 0.000001, 'g': 0.001, 'kg': 1, 'pound': 0.453592, 
    'ounce': 0.0283495, 'ton': 1000
  },
  Volume: {
    'ml': 0.001, 'L': 1, 'gallon': 3.78541, 
    'cup': 0.236588, 'tablespoon': 0.0147868, 'teaspoon': 0.00492892
  },
  Area: {
    'sq mm': 0.000001, 'sq cm': 0.0001, 'sq m': 1, 'sq km': 1000000, 
    'sq inch': 0.00064516, 'sq foot': 0.092903, 'acre': 4046.86, 'hectare': 10000
  },
  Speed: {
    'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knots': 0.514444
  },
  Time: {
    'ms': 0.001, 'second': 1, 'minute': 60, 'hour': 3600, 
    'day': 86400, 'week': 604800, 'month': 2629800, 'year': 31557600
  },
  Data: {
    'bit': 0.125, 'byte': 1, 'KB': 1024, 'MB': 1048576, 
    'GB': 1073741824, 'TB': 1099511627776, 'PB': 1125899906842624
  }
};

export default function UnitConverterTool() {
  const categories = Object.keys(unitData).concat(['Temperature']);
  const [category, setCategory] = useState<string>('Length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('km');
  const [value, setValue] = useState<string>('1');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    if (category === 'Temperature') {
      setFromUnit('Celsius');
      setToUnit('Fahrenheit');
    } else {
      const units = Object.keys(unitData[category]);
      setFromUnit(units[0]);
      setToUnit(units[1] || units[0]);
    }
  }, [category]);

  useEffect(() => {
    const val = parseFloat(value);
    if (isNaN(val)) {
      setResult('');
      return;
    }

    if (category === 'Temperature') {
      let c = 0;
      // Convert to Celsius first
      if (fromUnit === 'Celsius') c = val;
      else if (fromUnit === 'Fahrenheit') c = (val - 32) * 5/9;
      else if (fromUnit === 'Kelvin') c = val - 273.15;

      // Convert from Celsius to Target
      let res = 0;
      if (toUnit === 'Celsius') res = c;
      else if (toUnit === 'Fahrenheit') res = (c * 9/5) + 32;
      else if (toUnit === 'Kelvin') res = c + 273.15;

      setResult(res.toString());
    } else {
      const baseValue = val * unitData[category][fromUnit];
      const finalValue = baseValue / unitData[category][toUnit];
      setResult(finalValue.toString());
    }
  }, [value, fromUnit, toUnit, category]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const getUnitsForCategory = () => {
    if (category === 'Temperature') return ['Celsius', 'Fahrenheit', 'Kelvin'];
    return Object.keys(unitData[category]);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="neo-card p-6">
        <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">Category</label>
        <select className="neo-input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="neo-card p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full">
          <input type="number" className="neo-input w-full mb-2" value={value} onChange={(e) => setValue(e.target.value)} />
          <select className="neo-input w-full" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
            {getUnitsForCategory().map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        
        <button className="neo-btn neo-btn-secondary p-4 rounded-full shrink-0" onClick={swapUnits} aria-label="Swap units">
          ⇄
        </button>

        <div className="w-full">
          <input type="text" className="neo-input w-full mb-2 bg-surface font-bold text-accent" value={result ? parseFloat(result).toLocaleString(undefined, { maximumFractionDigits: 6 }) : ''} readOnly />
          <select className="neo-input w-full" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
            {getUnitsForCategory().map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
