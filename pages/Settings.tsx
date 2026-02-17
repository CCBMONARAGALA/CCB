
import React, { useState, useEffect } from 'react';
import { SettingsData } from '../types';
import { db } from '../db';
import { MapPin, Briefcase, Warehouse, Banknote, Save, X, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>(db.getSettings());
  
  // Separate states for each section to prevent mirroring
  const [inputs, setInputs] = useState({
    cdoDivisions: '',
    gnDivisions: '',
    programs: '',
    otherNurseries: ''
  });
  
  const [priceInput, setPriceInput] = useState({ price: '', desc: '' });

  const save = (newSettings: SettingsData) => {
    db.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const updateSectionInput = (key: keyof typeof inputs, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const addItem = (key: keyof typeof inputs) => {
    const val = inputs[key].trim();
    if (!val) return;
    
    const newSettings = { 
      ...settings, 
      [key]: [...(settings[key as keyof SettingsData] as string[]), val] 
    };
    
    save(newSettings);
    setInputs(prev => ({ ...prev, [key]: '' }));
  };

  const removeItem = (key: keyof typeof inputs, index: number) => {
    const currentList = [...(settings[key as keyof SettingsData] as string[])];
    currentList.splice(index, 1);
    const newSettings = { ...settings, [key]: currentList };
    save(newSettings);
  };

  const addPrice = () => {
    if (!priceInput.price) return;
    const newSettings = { 
      ...settings, 
      journalPrices: [
        ...settings.journalPrices, 
        { id: Date.now().toString(), price: priceInput.price, description: priceInput.desc }
      ] 
    };
    save(newSettings);
    setPriceInput({ price: '', desc: '' });
  };

  const removePrice = (id: string) => {
    const newPrices = settings.journalPrices.filter(p => p.id !== id);
    const newSettings = { ...settings, journalPrices: newPrices };
    save(newSettings);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* CDO Divisions */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="text-green-600" />
          <h3 className="text-lg font-bold">CDO Divisions</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="New CDO Division..." 
            value={inputs.cdoDivisions} 
            onChange={e => updateSectionInput('cdoDivisions', e.target.value)}
          />
          <button onClick={() => addItem('cdoDivisions')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.cdoDivisions.map((d, i) => (
            <span key={i} className="bg-gray-100 pl-3 pr-1 py-1 rounded-full text-sm text-gray-700 flex items-center gap-1 group">
              {d}
              <button 
                onClick={() => removeItem('cdoDivisions', i)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* GN Divisions */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="text-blue-600" />
          <h3 className="text-lg font-bold">GN Divisions</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="New GN Division..." 
            value={inputs.gnDivisions} 
            onChange={e => updateSectionInput('gnDivisions', e.target.value)}
          />
          <button onClick={() => addItem('gnDivisions')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.gnDivisions.map((d, i) => (
            <span key={i} className="bg-gray-100 pl-3 pr-1 py-1 rounded-full text-sm text-gray-700 flex items-center gap-1 group">
              {d}
              <button 
                onClick={() => removeItem('gnDivisions', i)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="text-purple-600" />
          <h3 className="text-lg font-bold">Programs</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="New Program Name..." 
            value={inputs.programs} 
            onChange={e => updateSectionInput('programs', e.target.value)}
          />
          <button onClick={() => addItem('programs')} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.programs.map((p, i) => (
            <span key={i} className="bg-gray-100 pl-3 pr-1 py-1 rounded-full text-sm text-gray-700 flex items-center gap-1 group">
              {p}
              <button 
                onClick={() => removeItem('programs', i)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Other Nurseries */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Warehouse className="text-amber-600" />
          <h3 className="text-lg font-bold">Other Nurseries</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="Nursery Name..." 
            value={inputs.otherNurseries} 
            onChange={e => updateSectionInput('otherNurseries', e.target.value)}
          />
          <button onClick={() => addItem('otherNurseries')} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.otherNurseries.map((n, i) => (
            <span key={i} className="bg-gray-100 pl-3 pr-1 py-1 rounded-full text-sm text-gray-700 flex items-center gap-1 group">
              {n}
              <button 
                onClick={() => removeItem('otherNurseries', i)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Journal Prices */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm lg:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <Banknote className="text-emerald-600" />
          <h3 className="text-lg font-bold">Journal Price Management</h3>
        </div>
        <div className="flex gap-3 mb-6">
          <input 
            type="text" 
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="Price (e.g. 750.00)" 
            value={priceInput.price} 
            onChange={e => setPriceInput({...priceInput, price: e.target.value})}
          />
          <input 
            type="text" 
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="Description..." 
            value={priceInput.desc} 
            onChange={e => setPriceInput({...priceInput, desc: e.target.value})}
          />
          <button onClick={addPrice} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Price
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {settings.journalPrices.map(jp => (
                <tr key={jp.id} className="group">
                  <td className="px-4 py-3 font-bold text-emerald-700">{jp.price}</td>
                  <td className="px-4 py-3 text-gray-500">{jp.description}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => removePrice(jp.id)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Settings;
