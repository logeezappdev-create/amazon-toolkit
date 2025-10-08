import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Upload, RefreshCw, Trash2, ExternalLink, Code, Package, Github, Globe, Settings, Edit2, Check, X } from 'lucide-react';

// Configuration
const SUPABASE_URL = 'https://jeqvjmzqcuklrjvglwrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcXZqbXpxY3VrbHJqdmdsd3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzU1NjEsImV4cCI6MjA3NTQ1MTU2MX0.HPBet3MeOla00wB4a5znjbX9PZecBwbDna0GfliisQY';
const VERCEL_TOKEN = 'VOTRE_VERCEL_TOKEN';

const AmazonToolkitStore = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Nom personnalisable du magasin
  const [storeName, setStoreName] = useState('Amazon Seller Toolkit');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('Amazon Seller Toolkit');
  
  // États pour chaque mode
  const [simpleApp, setSimpleApp] = useState({
    name: '', description: '', icon: '📱', color: 'purple', htmlContent: ''
  });
  
  const [boltApp, setBoltApp] = useState({
    name: '', description: '', icon: '⚛️', color: 'blue', files: []
  });
  
  const [githubApp, setGithubApp] = useState({
    name: '', description: '', icon: '🔗', color: 'purple', repoUrl: '', deploying: false
  });
  
  const [externalApp, setExternalApp] = useState({
    name: '', description: '', icon: '🌐', color: 'purple', externalUrl: ''
  });

  const [uploadProgress, setUploadProgress] = useState(0);

  const colors = {
    purple: 'from-purple-400 to-purple-600',
    blue: 'from-blue-400 to-blue-600',
    pink: 'from-pink-400 to-pink-600',
    violet: 'from-violet-400 to-violet-600',
    indigo: 'from-indigo-400 to-indigo-600',
    rose: 'from-rose-400 to-rose-600'
  };

  // Charger le nom du magasin depuis localStorage UNIQUEMENT côté client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('storeName');
      if (savedName) {
        setStoreName(savedName);
        setTempName(savedName);
      }
    }
  }, []);

  const supabaseFetch = async (endpoint, options = {}) => {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) throw new Error(`Erreur: ${response.statusText}`);
    return response.json();
  };

  const loadApps = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch('apps?is_active=eq.true&order=created_at.desc');
      setApps(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const deleteApp = async (id) => {
    if (!confirm('Supprimer cette app ?')) return;
    try {
      await supabaseFetch(`apps?id=eq.${id}`, { method: 'DELETE' });
      loadApps();
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  const addSimpleApp = async () => {
    if (!simpleApp.name || !simpleApp.htmlContent) {
      alert('⚠️ Nom et code HTML requis !');
      return;
    }
    try {
      setUploadProgress(30);
      const fileName = `${simpleApp.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.html`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/apps/${fileName}`;
      await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'text/html'
        },
        body: simpleApp.htmlContent
      });
      setUploadProgress(70);
      await supabaseFetch('apps', {
        method: 'POST',
        body: JSON.stringify({
          name: simpleApp.name,
          description: simpleApp.description,
          icon: simpleApp.icon,
          color: simpleApp.color,
          html_file: fileName,
          app_type: 'html',
          storage_path: `apps/${fileName}`
        })
      });
      setUploadProgress(100);
      alert('✅ App ajoutée !');
      closeModal();
      loadApps();
    } catch (error) {
      alert('❌ Erreur');
    } finally {
      setUploadProgress(0);
    }
  };

  const addBoltApp = async () => {
    if (!boltApp.name || boltApp.files.length === 0) {
      alert('⚠️ Nom et fichiers requis !');
      return;
    }
    try {
      setUploadProgress(10);
      const folderName = `${boltApp.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      let uploadedFiles = 0;
      for (const file of boltApp.files) {
        const filePath = `apps/${folderName}/${file.webkitRelativePath || file.name}`;
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${filePath}`;
        await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': file.type
          },
          body: file
        });
        uploadedFiles++;
        setUploadProgress(10 + (uploadedFiles / boltApp.files.length) * 60);
      }
      setUploadProgress(80);
      await supabaseFetch('apps', {
        method: 'POST',
        body: JSON.stringify({
          name: boltApp.name,
          description: boltApp.description,
          icon: boltApp.icon,
          color: boltApp.color,
          html_file: `${folderName}/index.html`,
          app_type: 'react',
          storage_path: `apps/${folderName}`
        })
      });
      setUploadProgress(100);
      alert('✅ App Bolt ajoutée !');
      closeModal();
      loadApps();
    } catch (error) {
      alert('❌ Erreur');
    } finally {
      setUploadProgress(0);
    }
  };

  const deployFromGithub = async () => {
    if (!githubApp.name || !githubApp.repoUrl) {
      alert('⚠️ Nom et URL GitHub requis !');
      return;
    }
    if (!VERCEL_TOKEN || VERCEL_TOKEN === 'VOTRE_VERCEL_TOKEN') {
      alert('⚠️ Token Vercel non configuré !');
      return;
    }
    try {
      setGithubApp({...githubApp, deploying: true});
      const match = githubApp.repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error('URL invalide');
      const [, owner, repo] = match;
      const vercelResponse = await fetch('https://api.vercel.com/v10/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: githubApp.name.toLowerCase().replace(/\s+/g, '-'),
          gitRepository: { type: 'github', repo: `${owner}/${repo}` },
          framework: 'nextjs'
        })
      });
      if (!vercelResponse.ok) throw new Error('Erreur Vercel');
      const vercelData = await vercelResponse.json();
      const vercelUrl = `https://${vercelData.name}.vercel.app`;
      await supabaseFetch('apps', {
        method: 'POST',
        body: JSON.stringify({
          name: githubApp.name,
          description: githubApp.description,
          icon: githubApp.icon,
          color: githubApp.color,
          html_file: vercelUrl,
          app_type: 'vercel',
          vercel_url: vercelUrl
        })
      });
      alert(`✅ Déployé !\n🔗 ${vercelUrl}`);
      closeModal();
      loadApps();
    } catch (error) {
      alert('❌ Erreur déploiement');
    } finally {
      setGithubApp({...githubApp, deploying: false});
    }
  };

  const addExternalApp = async () => {
    if (!externalApp.name || !externalApp.externalUrl) {
      alert('⚠️ Nom et URL requis !');
      return;
    }
    try {
      await supabaseFetch('apps', {
        method: 'POST',
        body: JSON.stringify({
          name: externalApp.name,
          description: externalApp.description,
          icon: externalApp.icon,
          color: externalApp.color,
          html_file: externalApp.externalUrl,
          app_type: 'external',
          vercel_url: externalApp.externalUrl
        })
      });
      alert('✅ App externe ajoutée !');
      closeModal();
      loadApps();
    } catch (error) {
      alert('❌ Erreur');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setAddMode(null);
    setSimpleApp({ name: '', description: '', icon: '📱', color: 'purple', htmlContent: '' });
    setBoltApp({ name: '', description: '', icon: '⚛️', color: 'blue', files: [] });
    setGithubApp({ name: '', description: '', icon: '🔗', color: 'purple', repoUrl: '', deploying: false });
    setExternalApp({ name: '', description: '', icon: '🌐', color: 'purple', externalUrl: '' });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setBoltApp({...boltApp, files});
  };

  const saveStoreName = () => {
    setStoreName(tempName);
    // Sauvegarder seulement côté client
    if (typeof window !== 'undefined') {
      localStorage.setItem('storeName', tempName);
    }
    setEditingName(false);
  };

  const cancelEditName = () => {
    setTempName(storeName);
    setEditingName(false);
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #F3E8FF 0%, #DBEAFE 50%, #FCE7F3 100%)'
    }}>
      {/* Header Glassmorphism */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
              }}>
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-2xl font-bold px-3 py-1 rounded-lg border-2 border-purple-400"
                      style={{ background: 'rgba(255,255,255,0.9)' }}
                    />
                    <button onClick={saveStoreName} className="p-2 bg-green-500 text-white rounded-lg">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={cancelEditName} className="p-2 bg-red-500 text-white rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold" style={{ color: '#7C3AED' }}>
                      {storeName}
                    </h1>
                    <button 
                      onClick={() => setEditingName(true)}
                      className="p-1 hover:bg-purple-100 rounded-lg transition-all"
                    >
                      <Edit2 className="w-5 h-5 text-purple-600" />
                    </button>
                  </div>
                )}
                <p className="text-sm" style={{ color: '#6B7280' }}>Magasin d'applications</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={loadApps}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
                className="hover:scale-105 transition-transform"
              >
                <RefreshCw className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
                className="hover:scale-105 transition-transform"
              >
                <Settings className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Boutons d'ajout - 4 OPTIONS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#7C3AED' }}>
            ➕ Ajouter une application
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Option 1 */}
            <button
              onClick={() => { setShowAddModal(true); setAddMode('simple'); }}
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                padding: '24px'
              }}
              className="text-left group hover:scale-105 transition-all"
            >
              <div style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                borderRadius: '16px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
              }}>
                <Code className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1F2937' }}>App Simple</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>Code HTML</p>
            </button>

            {/* Option 2 */}
            <button
              onClick={() => { setShowAddModal(true); setAddMode('bolt'); }}
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                padding: '24px'
              }}
              className="text-left group hover:scale-105 transition-all"
            >
              <div style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                borderRadius: '16px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}>
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1F2937' }}>App Bolt</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>Upload fichiers</p>
            </button>

            {/* Option 3 */}
            <button
              onClick={() => { setShowAddModal(true); setAddMode('github'); }}
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                padding: '24px'
              }}
              className="text-left group hover:scale-105 transition-all"
            >
              <div style={{
                background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                borderRadius: '16px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(31, 41, 55, 0.3)'
              }}>
                <Github className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1F2937' }}>GitHub</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>Deploy Vercel</p>
            </button>

            {/* Option 4 */}
            <button
              onClick={() => { setShowAddModal(true); setAddMode('external'); }}
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                padding: '24px'
              }}
              className="text-left group hover:scale-105 transition-all"
            >
              <div style={{
                background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                borderRadius: '16px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)'
              }}>
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1F2937' }}>App Externe</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>URL Azure/Vercel</p>
            </button>
          </div>
        </div>

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.2)',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold" style={{ color: '#7C3AED' }}>
                    {addMode === 'simple' && '📝 App Simple'}
                    {addMode === 'bolt' && '📦 App Bolt'}
                    {addMode === 'github' && '🔗 GitHub'}
                    {addMode === 'external' && '🌐 App Externe'}
                  </h2>
                  <button onClick={closeModal} className="text-3xl text-gray-500 hover:text-gray-700">×</button>
                </div>

                {/* Formulaires selon le mode */}
                {addMode === 'simple' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Nom *</label>
                        <input
                          type="text"
                          value={simpleApp.name}
                          onChange={(e) => setSimpleApp({...simpleApp, name: e.target.value})}
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '2px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '12px',
                            padding: '12px'
                          }}
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-2">Icône</label>
                          <input
                            type="text"
                            value={simpleApp.icon}
                            onChange={(e) => setSimpleApp({...simpleApp, icon: e.target.value})}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              fontSize: '24px'
                            }}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">Couleur</label>
                          <select
                            value={simpleApp.color}
                            onChange={(e) => setSimpleApp({...simpleApp, color: e.target.value})}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '2px solid rgba(139, 92, 246, 0.2)',
                              borderRadius: '12px',
                              padding: '12px'
                            }}
                            className="w-full"
                          >
                            {Object.keys(colors).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input
                        type="text"
                        value={simpleApp.description}
                        onChange={(e) => setSimpleApp({...simpleApp, description: e.target.value})}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(139, 92, 246, 0.2)',
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Code HTML *</label>
                      <textarea
                        value={simpleApp.htmlContent}
                        onChange={(e) => setSimpleApp({...simpleApp, htmlContent: e.target.value})}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(139, 92, 246, 0.2)',
                          borderRadius: '12px',
                          padding: '12px',
                          fontFamily: 'monospace'
                        }}
                        className="w-full"
                        rows="10"
                      />
                    </div>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div style={{
                          background: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
                          width: `${uploadProgress}%`,
                          height: '100%',
                          borderRadius: '9999px',
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button 
                        onClick={addSimpleApp}
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                          color: 'white',
                          borderRadius: '16px',
                          padding: '16px 32px',
                          fontWeight: 'bold',
                          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
                        }}
                        className="flex-1 hover:scale-105 transition-transform"
                      >
                        ✅ Ajouter
                      </button>
                      <button 
                        onClick={closeModal}
                        style={{
                          background: 'rgba(156, 163, 175, 0.2)',
                          borderRadius: '16px',
                          padding: '16px 32px',
                          fontWeight: 'bold'
                        }}
                        className="hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {addMode === 'bolt' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Nom *</label>
                        <input
                          type="text"
                          value={boltApp.name}
                          onChange={(e) => setBoltApp({...boltApp, name: e.target.value})}
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '2px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '12px',
                            padding: '12px'
                          }}
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-2">Icône</label>
                          <input
                            type="text"
                            value={boltApp.icon}
                            onChange={(e) => setBoltApp({...boltApp, icon: e.target.value})}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              fontSize: '24px'
                            }}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">Couleur</label>
                          <select
                            value={boltApp.color}
                            onChange={(e) => setBoltApp({...boltApp, color: e.target.value})}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '2px solid rgba(59, 130, 246, 0.2)',
                              borderRadius: '12px',
                              padding: '12px'
                            }}
                            className="w-full"
                          >
                            {Object.keys(colors).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input
                        type="text"
                        value={boltApp.description}
                        onChange={(e) => setBoltApp({...boltApp, description: e.target.value})}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Fichiers *</label>
                      <div style={{
                        border: '2px dashed rgba(59, 130, 246, 0.3)',
                        borderRadius: '16px',
                        padding: '32px',
                        textAlign: 'center',
                        background: 'rgba(219, 234, 254, 0.3)'
                      }}>
                        <input
                          type="file"
                          multiple
                          webkitdirectory="true"
                          directory="true"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload-bolt"
                        />
                        <label htmlFor="file-upload-bolt" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                          <p className="font-semibold text-gray-700">Sélectionner dossier</p>
                          <p className="text-sm text-gray-500 mt-2">/dist/ ou /build/</p>
                        </label>
                        {boltApp.files.length > 0 && (
                          <p className="mt-3 font-bold text-green-600">{boltApp.files.length} fichiers</p>
                        )}
                      </div>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div style={{
                          background: 'linear-gradient(90deg, #3B82F6, #2563EB)',
                          width: `${uploadProgress}%`,
                          height: '100%',
                          borderRadius: '9999px',
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button 
                        onClick={addBoltApp}
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                          color: 'white',
                          borderRadius: '16px',
                          padding: '16px 32px',
                          fontWeight: 'bold',
                          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
                        }}
                        className="flex-1 hover:scale-105 transition-transform"
                      >
                        ✅ Uploader
                      </button>
                      <button 
                        onClick={closeModal}
                        style={{
                          background: 'rgba(156, 163, 175, 0.2)',
                          borderRadius: '16px',
                          padding: '16px 32px',
                          fontWeight: 'bold'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {addMode === 'github' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '2px solid rgba(251, 191, 36, 0.3)' }}>
                      <p className="text-sm text-yellow-800">⚠️ Token Vercel requis dans le code</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Nom *</label>
                        <input
                          type="text"
                          value={githubApp.name}
                          onChange={(e) => setGithubApp({...githubApp, name: e.target.value})}
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '2px solid rgba(31, 41, 55, 0.2)',
                            borderRadius: '12px',
                            padding: '12px'
                          }}
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-2">Icône</label>
                          <input
                            type="text"
                            value={githubApp.icon}
                            onChange={(e) => setGithubApp({...githubApp, icon: e.target.value})}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              fontSize: '24px'
                            }}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">Couleur</label>
                          <select
                            value={githubApp.color}
                            onChange={(e) => setGithubApp({...githubApp, color: e.target.value})}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '2px solid rgba(31, 41, 55, 0.2)',
                              borderRadius: '12px',
                              padding: '12px'
                            }}
                            className="w-full"
                          >
                            {Object.keys(colors).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input
                        type="text"
                        value={githubApp.description}
                        onChange={(e) => setGithubApp({...githubApp, description: e.target.value})}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(31, 41, 55, 0.2)',
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">URL GitHub *</label>
                      <input
                        type="text"
                        value={githubApp.repoUrl}
                        onChange={(e) => setGithubApp({...githubApp, repoUrl: e.target.value})}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(31, 41, 55, 0.2)',
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                        className="w-full"
                        placeholder="https://github.com/username/repo"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={deployFromGithub}
                        disabled={githubApp.deploying}
                        style={{
                          background: 'linear-gradient(135deg, #1F2937, #111827)',
                          color: 'white',
                          borderRadius: '16px',
                          padding: '16px 32px',
                          fontWeight: 'bold',
                          boxShadow: '0 8px 24px rgba(31, 41, 55, 0.4)'
                        }}
                        className="flex-1 hover:scale-105 transition-transform disabled:opacity-50"
                      >
                        {githubApp.deploying ? '⏳ Déploiement...' : '🚀 Déployer'}
                      </button>
                      <button 
                        onClick={closeModal}
                        style={{
                          background: 'rgba(156, 163, 175, 0.2)',
                          borderRadius: '16px',
                          padding: '16px 32px',
                          fontWeight: 'bold'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {addMode === 'external' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ background: 'rgba(236, 72, 153, 0.1)', border: '2px solid rgba(236, 72, 153, 0.3)' }}>
                      <p className="text-sm text-pink-800">🌐 Ajoutez une app hébergée ailleurs (Azure, Vercel, Netlify...)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Nom *</label>
                        <input
                          type="text"
                          value={externalApp.name}
                          onChange={(e) => setExternalApp({...externalApp, name: e.target.value})}
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '2px solid rgba(236, 72, 153, 0.2)',
                            borderRadius: '12px',
                            padding: '12px'
                          }}
                          className="w-full"
                          placeholder="Mon App Azure"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-2">Icône</label>
                          <input
                            type="text"
                            value={externalApp.icon}
                            onChange={(e) => setExternalApp({...externalApp, icon: e.target.value})}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              fontSize: '24px'
                            }}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">Couleur</label>
                          <select
                            value={externalApp.color}
                            onChange={(e) => setExternalApp({...externalApp, color: e.target.value})}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: '2px solid rgba(236, 72, 153, 0.2)',
                              borderRadius: '12px',
                              padding: '12px'
                            }}
                            className="w-full"
                          >
                            {Object.keys(colors).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input
                        type="text"
                        value={externalApp.description}
                        onChange={(e) => setExternalApp({...externalApp, description: e.target.value})}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(236, 72, 153, 0.2)',
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                        className="w-full"
                        placeholder="Mon application hébergée sur Azure"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">URL Complète *</label>
                      <input
                        type="url"
                        value={externalApp.externalUrl}
                        onChange={(e) => setExternalApp({...externalApp, externalUrl: e.target.value})}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '2px solid rgba(236, 72, 153, 0.2)',
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                        className="w-full"
                        placeholder="https://mon-app.azurestaticapps.net"
                      />
                      <p className="text-xs mt-2 text-gray-600">Exemples: Azure, Vercel, Netlify, votre domaine...</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={addExternalApp}
                        style={{
                          background: 'linear-gradient(135deg, #EC4899, #DB2777)',
                          color: 'white',
                          borderRadius: '16px',
                          padding: '16px 32px',
                          fontWeight: 'bold',
                          boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)'
                        }}
                        className="flex-1 hover:scale-105 transition-transform"
                      >
                        ✅ Ajouter
                      </button>
                      <button 
                        onClick={closeModal}
                        style={{
                          background: 'rgba(156, 163, 175, 0.2)',
                          borderRadius: '16px',
                          padding: '16px 32px',
                          fontWeight: 'bold'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Liste des apps */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500" style={{ borderTopColor: 'transparent' }}></div>
            <p className="mt-4 font-semibold" style={{ color: '#7C3AED' }}>Chargement...</p>
          </div>
        ) : apps.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)'
          }}>
            <p className="text-2xl font-bold" style={{ color: '#7C3AED' }}>Aucune application</p>
            <p className="mt-2" style={{ color: '#6B7280' }}>Ajoutez votre première app ! ☝️</p>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#7C3AED' }}>
              📱 Mes Applications ({apps.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden'
                  }}
                  className="hover:scale-105 transition-all"
                >
                  <div style={{
                    background: `linear-gradient(135deg, ${colors[app.color]?.split(' ')[0].replace('from-', '')} 0%, ${colors[app.color]?.split(' ')[2].replace('to-', '')} 100%)`,
                    padding: '24px'
                  }}>
                    <div className="text-5xl mb-3">{app.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
                    {app.app_type && (
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {app.app_type === 'html' && '📝 HTML'}
                        {app.app_type === 'react' && '⚛️ React'}
                        {app.app_type === 'vercel' && '▲ Vercel'}
                        {app.app_type === 'external' && '🌐 Externe'}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-sm mb-4 h-12" style={{ color: '#6B7280' }}>{app.description}</p>
                    <div className="flex gap-2">
                      <a
                        href={app.vercel_url || `${SUPABASE_URL}/storage/v1/object/public/${app.storage_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                          color: 'white',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                        }}
                        className="flex-1 hover:scale-105 transition-transform"
                      >
                        Ouvrir
                      </a>
                      <button
                        onClick={() => deleteApp(app.id)}
                        style={{
                          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                        className="hover:scale-105 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        marginTop: '64px',
        padding: '24px'
      }}>
        <div className="container mx-auto px-4 text-center">
          <p style={{ color: '#7C3AED', fontWeight: 'bold' }}>{storeName} © 2025</p>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Powered by Supabase + GitHub + Vercel</p>
        </div>
      </footer>
    </div>
  );
};

export default AmazonToolkitStore;
