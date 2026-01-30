'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { storage } from '../lib/storage';
import type { Settings, ThreadOption, BattingOption } from '../types';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(storage.getSettings());
  const [activeTab, setActiveTab] = useState<'business' | 'pricing' | 'thread' | 'batting' | 'data'>('business');

  // Thread state
  const [newThreadName, setNewThreadName] = useState('');
  const [newThreadPrice, setNewThreadPrice] = useState('');

  // Batting state
  const [newBattingName, setNewBattingName] = useState('');
  const [newBattingWidth, setNewBattingWidth] = useState('');
  const [newBattingPrice, setNewBattingPrice] = useState('');

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const handleSaveSettings = () => {
    storage.saveSettings(settings);
    alert('Settings saved!');
  };

  const handleAddThread = () => {
    if (!newThreadName || !newThreadPrice) {
      alert('Please enter thread name and price');
      return;
    }

    const newThread: ThreadOption = {
      name: newThreadName,
      price: parseFloat(newThreadPrice),
      isDefault: settings.threadOptions.length === 0
    };

    const updated = {
      ...settings,
      threadOptions: [...settings.threadOptions, newThread]
    };

    setSettings(updated);
    storage.saveSettings(updated);
    setNewThreadName('');
    setNewThreadPrice('');
  };

  const handleDeleteThread = (name: string) => {
    if (!confirm(`Delete thread option "${name}"?`)) return;

    const updated = {
      ...settings,
      threadOptions: settings.threadOptions.filter(t => t.name !== name)
    };

    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleSetDefaultThread = (name: string) => {
    const updated = {
      ...settings,
      threadOptions: settings.threadOptions.map(t => ({
        ...t,
        isDefault: t.name === name
      }))
    };

    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleAddBatting = () => {
    if (!newBattingName || !newBattingWidth || !newBattingPrice) {
      alert('Please enter batting name, width, and price per inch');
      return;
    }

    const newBatting: BattingOption = {
      name: newBattingName,
      widthInches: parseFloat(newBattingWidth),
      pricePerInch: parseFloat(newBattingPrice),
      isDefault: settings.battingOptions.length === 0
    };

    const updated = {
      ...settings,
      battingOptions: [...settings.battingOptions, newBatting]
    };

    setSettings(updated);
    storage.saveSettings(updated);
    setNewBattingName('');
    setNewBattingWidth('');
    setNewBattingPrice('');
  };

  const handleDeleteBatting = (name: string, width: number) => {
    if (!confirm(`Delete batting option "${name}" (${width}")?`)) return;

    const updated = {
      ...settings,
      battingOptions: settings.battingOptions.filter(
        b => !(b.name === name && b.widthInches === width)
      )
    };

    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleSetDefaultBatting = (name: string, width: number) => {
    const updated = {
      ...settings,
      battingOptions: settings.battingOptions.map(b => ({
        ...b,
        isDefault: b.name === name && b.widthInches === width
      }))
    };

    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleExportCSV = () => {
    const projects = storage.getProjects();
    
    const headers = [
      'ID',
      'Stage',
      'Client First Name',
      'Client Last Name',
      'Email',
      'Phone',
      'Intake Date',
      'Due Date',
      'Description',
      'Quilt Width',
      'Quilt Length',
      'Service Type',
      'Created At'
    ];

    const rows = projects.map(p => [
      p.id,
      p.stage,
      p.clientFirstName,
      p.clientLastName,
      p.clientEmail || '',
      p.clientPhone || '',
      p.intakeDate,
      p.dueDate || '',
      p.description || '',
      p.quiltWidth || '',
      p.quiltLength || '',
      p.serviceType || '',
      p.createdAt
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stitchqueue-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = () => {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) return;
    if (!confirm('Really sure? All projects, settings, and data will be deleted!')) return;

    localStorage.clear();
    alert('All data cleared! Reloading...');
    window.location.reload();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert('Logo file must be smaller than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const updated = {
        ...settings,
        logoUrl: event.target.result
      };
      setSettings(updated);
      storage.saveSettings(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    const updated = { ...settings, logoUrl: '' };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-plum">Settings</h1>
            <p className="text-sm text-muted mt-1">Configure your StitchQueue system</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Tier Badge */}
        <div className="bg-white border border-line rounded-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">
                Current Tier: {settings.isPaidTier ? 'PAID' : 'FREE'}
              </div>
              <div className="text-xs text-muted mt-1">
                {settings.isPaidTier 
                  ? 'All features unlocked' 
                  : 'Upgrade to unlock saved rates and email features'}
              </div>
            </div>
            <button
              onClick={() => {
                const updated = { ...settings, isPaidTier: !settings.isPaidTier };
                setSettings(updated);
                storage.saveSettings(updated);
              }}
              className="px-4 py-2 bg-plum text-white rounded-xl text-sm font-bold"
            >
              Toggle Tier (Demo)
            </button>
          </div>

          {!settings.isPaidTier && (
            <div className="mt-4 p-3 bg-gold/10 rounded-xl text-xs">
              <div className="font-bold mb-2">PAID Tier Features ($19/mo):</div>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Save pricing rates (auto-populate calculator)</li>
                <li>Save thread & batting options</li>
                <li>Email estimates/invoices</li>
                <li>Branded client intake form</li>
                <li>Multi-user access (up to 5 users)</li>
                <li>Advanced reports</li>
              </ul>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-line overflow-x-auto">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap ${
              activeTab === 'business'
                ? 'text-plum border-b-2 border-plum'
                : 'text-muted hover:text-plum'
            }`}
          >
            Business Info
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'text-plum border-b-2 border-plum'
                : 'text-muted hover:text-plum'
            }`}
          >
            Pricing Rates
          </button>
          <button
            onClick={() => setActiveTab('thread')}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap ${
              activeTab === 'thread'
                ? 'text-plum border-b-2 border-plum'
                : 'text-muted hover:text-plum'
            }`}
          >
            Thread Options
          </button>
          <button
            onClick={() => setActiveTab('batting')}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap ${
              activeTab === 'batting'
                ? 'text-plum border-b-2 border-plum'
                : 'text-muted hover:text-plum'
            }`}
          >
            Batting Options
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap ${
              activeTab === 'data'
                ? 'text-plum border-b-2 border-plum'
                : 'text-muted hover:text-plum'
            }`}
          >
            Data Management
          </button>
        </div>

        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="bg-white border border-line rounded-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-plum mb-4">Business Information</h2>
              
              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settings.businessName || ''}
                    onChange={(e) => {
                      const updated = { ...settings, businessName: e.target.value };
                      setSettings(updated);
                      storage.saveSettings(updated);
                    }}
                    placeholder="Stitched By Susan"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.address || ''}
                    onChange={(e) => {
                      const updated = { ...settings, address: e.target.value };
                      setSettings(updated);
                      storage.saveSettings(updated);
                    }}
                    placeholder="123 Main St, City, State 12345"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email || ''}
                      onChange={(e) => {
                        const updated = { ...settings, email: e.target.value };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      placeholder="susan@stitchedbysusan.com"
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.phone || ''}
                      onChange={(e) => {
                        const updated = { ...settings, phone: e.target.value };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={settings.website || ''}
                    onChange={(e) => {
                      const updated = { ...settings, website: e.target.value };
                      setSettings(updated);
                      storage.saveSettings(updated);
                    }}
                    placeholder="https://stitchedbysusan.com"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Business Logo
                  </label>
                  {settings.logoUrl ? (
                    <div className="flex items-center gap-4">
                      <img 
                        src={settings.logoUrl} 
                        alt="Business logo" 
                        className="h-20 w-20 object-contain border border-line rounded-xl p-2"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="px-4 py-2 border border-line rounded-xl hover:bg-background transition-colors text-sm"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full px-4 py-2 border border-line rounded-xl"
                      />
                      <p className="text-xs text-muted mt-2">
                        Max file size: 500KB. Recommended: Square image, PNG with transparency.
                      </p>
                    </div>
                  )}
                </div>

                {/* Brand Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Primary Brand Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.brandPrimaryColor || '#4e283a'}
                        onChange={(e) => {
                          const updated = { ...settings, brandPrimaryColor: e.target.value };
                          setSettings(updated);
                          storage.saveSettings(updated);
                        }}
                        className="h-10 w-20 border border-line rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.brandPrimaryColor || '#4e283a'}
                        onChange={(e) => {
                          const updated = { ...settings, brandPrimaryColor: e.target.value };
                          setSettings(updated);
                          storage.saveSettings(updated);
                        }}
                        placeholder="#4e283a"
                        className="flex-1 px-4 py-2 border border-line rounded-xl font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Secondary Brand Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.brandSecondaryColor || '#98823a'}
                        onChange={(e) => {
                          const updated = { ...settings, brandSecondaryColor: e.target.value };
                          setSettings(updated);
                          storage.saveSettings(updated);
                        }}
                        className="h-10 w-20 border border-line rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.brandSecondaryColor || '#98823a'}
                        onChange={(e) => {
                          const updated = { ...settings, brandSecondaryColor: e.target.value };
                          setSettings(updated);
                          storage.saveSettings(updated);
                        }}
                        placeholder="#98823a"
                        className="flex-1 px-4 py-2 border border-line rounded-xl font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Measurement System */}
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Measurement System
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={settings.measurementSystem === 'imperial'}
                        onChange={() => {
                          const updated = { ...settings, measurementSystem: 'imperial' as const };
                          setSettings(updated);
                          storage.saveSettings(updated);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Imperial (inches)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={settings.measurementSystem === 'metric'}
                        onChange={() => {
                          const updated = { ...settings, measurementSystem: 'metric' as const };
                          setSettings(updated);
                          storage.saveSettings(updated);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Metric (centimeters)</span>
                    </label>
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.currencyCode || 'USD'}
                    onChange={(e) => {
                      const updated = { ...settings, currencyCode: e.target.value };
                      setSettings(updated);
                      storage.saveSettings(updated);
                    }}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  >
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="CAD">CAD - Canadian Dollar ($)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="AUD">AUD - Australian Dollar ($)</option>
                  </select>
                </div>

                {/* Tax */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={settings.taxRate || 0}
                      onChange={(e) => {
                        const updated = { ...settings, taxRate: parseFloat(e.target.value) || 0 };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      placeholder="8.5"
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Tax Label
                    </label>
                    <input
                      type="text"
                      value={settings.taxLabel || 'Sales Tax'}
                      onChange={(e) => {
                        const updated = { ...settings, taxLabel: e.target.value };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      placeholder="Sales Tax"
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>

                {/* ESTIMATE NUMBERING - NEW */}
                <div className="border-t border-line pt-6 mt-6">
                  <h3 className="text-md font-bold text-plum mb-4">Estimate Numbering</h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-muted">
                      Next Estimate Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.nextEstimateNumber || 1001}
                      onChange={(e) => {
                        const updated = { ...settings, nextEstimateNumber: parseInt(e.target.value) || 1001 };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                    <p className="text-xs text-muted">
                      The next estimate you create will use this number. Change this to match your accounting system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Rates Tab */}
        {activeTab === 'pricing' && (
          <div className="bg-white border border-line rounded-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-plum">Quilting Rates</h2>
              <p className="text-sm text-muted mt-1">
                {settings.isPaidTier 
                  ? 'Set your pricing rates (per square inch)' 
                  : 'Available in PAID tier'}
              </p>
            </div>

            {!settings.isPaidTier ? (
              <div className="p-6 bg-gold/10 rounded-xl text-center">
                <p className="text-sm text-muted mb-4">
                  Upgrade to PAID tier to save pricing rates and auto-populate the calculator
                </p>
                <button
                  onClick={() => {
                    const updated = { ...settings, isPaidTier: true };
                    setSettings(updated);
                    storage.saveSettings(updated);
                  }}
                  className="px-6 py-3 bg-plum text-white rounded-xl font-bold"
                >
                  Enable PAID Tier (Demo)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quilting Rates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Light Edge-to-Edge ($/sq in)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.pricingRates?.lightE2E || ''}
                      onChange={(e) => {
                        const updated = {
                          ...settings,
                          pricingRates: {
                            ...settings.pricingRates,
                            lightE2E: parseFloat(e.target.value) || 0
                          }
                        };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Standard Edge-to-Edge ($/sq in)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.pricingRates?.standardE2E || ''}
                      onChange={(e) => {
                        const updated = {
                          ...settings,
                          pricingRates: {
                            ...settings.pricingRates,
                            standardE2E: parseFloat(e.target.value) || 0
                          }
                        };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Light Custom ($/sq in)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.pricingRates?.lightCustom || ''}
                      onChange={(e) => {
                        const updated = {
                          ...settings,
                          pricingRates: {
                            ...settings.pricingRates,
                            lightCustom: parseFloat(e.target.value) || 0
                          }
                        };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Custom ($/sq in)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.pricingRates?.custom || ''}
                      onChange={(e) => {
                        const updated = {
                          ...settings,
                          pricingRates: {
                            ...settings.pricingRates,
                            custom: parseFloat(e.target.value) || 0
                          }
                        };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Dense Custom ($/sq in)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settings.pricingRates?.denseCustom || ''}
                      onChange={(e) => {
                        const updated = {
                          ...settings,
                          pricingRates: {
                            ...settings.pricingRates,
                            denseCustom: parseFloat(e.target.value) || 0
                          }
                        };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>

                {/* Binding Rates */}
                <div className="border-t border-line pt-6 mt-6">
                  <h3 className="text-md font-bold text-plum mb-4">Binding Rates (per inch)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-muted mb-2">
                        Top Attached Only ($/in)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.pricingRates?.bindingTopAttached || ''}
                        onChange={(e) => {
                          const updated = {
                            ...settings,
                            pricingRates: {
                              ...settings.pricingRates,
                              bindingTopAttached: parseFloat(e.target.value) || 0
                            }
                          };
                          setSettings(updated);
                          storage.saveSettings(updated);
                        }}
                        placeholder="0.10"
                        className="w-full px-4 py-2 border border-line rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-muted mb-2">
                        Fully Attached ($/in)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.pricingRates?.bindingFullyAttached || ''}
                        onChange={(e) => {
                          const updated = {
                            ...settings,
                            pricingRates: {
                              ...settings.pricingRates,
                              bindingFullyAttached: parseFloat(e.target.value) || 0
                            }
                          };
                          setSettings(updated);
                          storage.saveSettings(updated);
                        }}
                        placeholder="0.20"
                        className="w-full px-4 py-2 border border-line rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Bobbin Price */}
                <div className="border-t border-line pt-6 mt-6">
                  <h3 className="text-md font-bold text-plum mb-4">Other Pricing</h3>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">
                      Bobbin Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.bobbinPrice || ''}
                      onChange={(e) => {
                        const updated = { ...settings, bobbinPrice: parseFloat(e.target.value) || 0 };
                        setSettings(updated);
                        storage.saveSettings(updated);
                      }}
                      placeholder="2.50"
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thread Options Tab */}
        {activeTab === 'thread' && (
          <div className="bg-white border border-line rounded-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-plum">Thread Options</h2>
              <p className="text-sm text-muted mt-1">
                {settings.isPaidTier 
                  ? 'Manage your thread options and pricing' 
                  : 'Available in PAID tier'}
              </p>
            </div>

            {!settings.isPaidTier ? (
              <div className="p-6 bg-gold/10 rounded-xl text-center">
                <p className="text-sm text-muted mb-4">
                  Upgrade to PAID tier to save thread options
                </p>
                <button
                  onClick={() => {
                    const updated = { ...settings, isPaidTier: true };
                    setSettings(updated);
                    storage.saveSettings(updated);
                  }}
                  className="px-6 py-3 bg-plum text-white rounded-xl font-bold"
                >
                  Enable PAID Tier (Demo)
                </button>
              </div>
            ) : (
              <>
                {/* Add Thread */}
                <div className="mb-6 p-4 bg-background rounded-xl">
                  <h3 className="text-sm font-bold text-plum mb-3">Add Thread Option</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Thread name (e.g., So Fine #50)"
                      value={newThreadName}
                      onChange={(e) => setNewThreadName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-line rounded-xl"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={newThreadPrice}
                      onChange={(e) => setNewThreadPrice(e.target.value)}
                      className="w-32 px-4 py-2 border border-line rounded-xl"
                    />
                    <button
                      onClick={handleAddThread}
                      className="px-6 py-2 bg-plum text-white rounded-xl font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Thread List */}
                <div className="space-y-2">
                  {settings.threadOptions.length === 0 ? (
                    <p className="text-sm text-muted text-center py-8">
                      No thread options yet. Add one above!
                    </p>
                  ) : (
                    settings.threadOptions.map((thread) => (
                      <div
                        key={thread.name}
                        className="flex items-center justify-between p-4 border border-line rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-sm">{thread.name}</div>
                          <div className="text-xs text-muted mt-1">
                            ${thread.price.toFixed(2)}
                            {thread.isDefault && (
                              <span className="ml-2 px-2 py-0.5 bg-gold/20 text-gold rounded text-xs font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!thread.isDefault && (
                            <button
                              onClick={() => handleSetDefaultThread(thread.name)}
                              className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteThread(thread.name)}
                            className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Batting Options Tab */}
        {activeTab === 'batting' && (
          <div className="bg-white border border-line rounded-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-plum">Batting Options</h2>
              <p className="text-sm text-muted mt-1">
                {settings.isPaidTier 
                  ? 'Manage your batting options and pricing' 
                  : 'Available in PAID tier'}
              </p>
            </div>

            {!settings.isPaidTier ? (
              <div className="p-6 bg-gold/10 rounded-xl text-center">
                <p className="text-sm text-muted mb-4">
                  Upgrade to PAID tier to save batting options
                </p>
                <button
                  onClick={() => {
                    const updated = { ...settings, isPaidTier: true };
                    setSettings(updated);
                    storage.saveSettings(updated);
                  }}
                  className="px-6 py-3 bg-plum text-white rounded-xl font-bold"
                >
                  Enable PAID Tier (Demo)
                </button>
              </div>
            ) : (
              <>
                {/* Add Batting */}
                <div className="mb-6 p-4 bg-background rounded-xl">
                  <h3 className="text-sm font-bold text-plum mb-3">Add Batting Option</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Batting name (e.g., Warm & Natural)"
                      value={newBattingName}
                      onChange={(e) => setNewBattingName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-line rounded-xl"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Width (in)"
                      value={newBattingWidth}
                      onChange={(e) => setNewBattingWidth(e.target.value)}
                      className="w-32 px-4 py-2 border border-line rounded-xl"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="$/inch"
                      value={newBattingPrice}
                      onChange={(e) => setNewBattingPrice(e.target.value)}
                      className="w-32 px-4 py-2 border border-line rounded-xl"
                    />
                    <button
                      onClick={handleAddBatting}
                      className="px-6 py-2 bg-plum text-white rounded-xl font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Batting List */}
                <div className="space-y-2">
                  {settings.battingOptions.length === 0 ? (
                    <p className="text-sm text-muted text-center py-8">
                      No batting options yet. Add one above!
                    </p>
                  ) : (
                    settings.battingOptions.map((batting) => (
                      <div
                        key={`${batting.name}-${batting.widthInches}`}
                        className="flex items-center justify-between p-4 border border-line rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-sm">
                            {batting.name} - {batting.widthInches}" wide
                          </div>
                          <div className="text-xs text-muted mt-1">
                            ${batting.pricePerInch.toFixed(4)}/inch
                            {batting.isDefault && (
                              <span className="ml-2 px-2 py-0.5 bg-gold/20 text-gold rounded text-xs font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!batting.isDefault && (
                            <button
                              onClick={() => handleSetDefaultBatting(batting.name, batting.widthInches)}
                              className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBatting(batting.name, batting.widthInches)}
                            className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="bg-white border border-line rounded-card p-6">
            <h2 className="text-lg font-bold text-plum mb-4">Data Management</h2>
            
            <div className="space-y-6">
              {/* Export CSV */}
              <div className="p-4 border border-line rounded-xl">
                <h3 className="font-bold text-sm mb-2">Export Data</h3>
                <p className="text-xs text-muted mb-4">
                  Export all your projects to a CSV file for backup or use in other software.
                </p>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-plum text-white rounded-xl font-bold"
                >
                  Export to CSV
                </button>
              </div>

              {/* Clear All Data */}
              <div className="p-4 border border-red-300 rounded-xl bg-red-50">
                <h3 className="font-bold text-sm text-red-600 mb-2">Danger Zone</h3>
                <p className="text-xs text-muted mb-4">
                  Clear all data including projects, settings, and preferences. This cannot be undone!
                </p>
                <button
                  onClick={handleClearAllData}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
