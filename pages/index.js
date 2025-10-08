import React, { useState, useEffect } from 'react';
import { ShoppingCart, Upload, RefreshCw, Trash2, Code, Package, Github, Globe, Settings, Edit2, Check, X } from 'lucide-react';

const SUPABASE_URL = 'https://jeqvjmzqcuklrjvglwrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcXZqbXpxY3VrbHJqdmdsd3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzU1NjEsImV4cCI6MjA3NTQ1MTU2MX0.HPBet3MeOla00wB4a5znjbX9PZecBwbDna0GfliisQY';
const VERCEL_TOKEN = 'VOTRE_VERCEL_TOKEN';

const AmazonToolkitStore = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState(null);
  const [storeName, setStoreName] = useState('Amazon Seller Toolkit');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('Amazon Seller Toolkit');
  
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
    if (!window.confirm('Supprimer cette app ?')) return;
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
      const repoMatch = githubApp.repoUrl.match(/github\.com[:/]([^/]+)[:/]([^/.]+)/);
      if (!repoMatch) throw new Error('URL invalide');
      const owner = repoMatch[1];
      const repo = repoMatch[2];
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
    setEditingName(false);
  };

  const cancelEditName = () => {
    setTempName(storeName);
    setEditingName(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <header className="bg-white bg-opacity-70 backdrop-blur-lg border-b border-white border-opacity-20 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-3 shadow-lg">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-2xl font-bold px-3 py-1 rounded-lg border-2 border-purple-400 bg-white bg-opacity-90"
                    />
                    <button onClick={saveStoreName} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={cancelEditName} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-purple-700">{storeName}</h1>
                    <button onClick={() => setEditingName(true)} className="p-1 hover:bg-purple-100 rounded-lg transition-all">
                      <Edit2 className="w-5 h-5 text-purple-600" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-600">Magasin d'applications</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={loadApps} className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-3 shadow-md hover:scale-105 transition-transform">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </button>
              <button className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-3 shadow-md hover:scale-105 transition-transform">
                <Settings className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-purple-700">➕ Ajouter une application</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => { setShowAddModal(true); setAddMode('simple'); }} className="bg-white bg-opacity-70 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 shadow-xl p-6 text-left hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl w-14 h-14 flex items-center justify-center mb-4 shadow-lg">
                <Code className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">App Simple</h3>
              <p className="text-sm text-gray-600">Code HTML</p>
            </button>

            <button onClick={() => { setShowAddModal(true); setAddMode('bolt'); }} className="bg-white bg-opacity-70 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 shadow-xl p-6 text-left hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl w-14 h-14 flex items-center justify-center mb-4 shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">App Bolt</h3>
              <p className="text-sm text-gray-600">Upload fichiers</p>
            </button>

            <button onClick={() => { setShowAddModal(true); setAddMode('github'); }} className="bg-white bg-opacity-70 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 shadow-xl p-6 text-left hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-14 h-14 flex items-center justify-center mb-4 shadow-lg">
                <Github className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">GitHub</h3>
              <p className="text-sm text-gray-600">Deploy Vercel</p>
            </button>

            <button onClick={() => { setShowAddModal(true); setAddMode('external'); }} className="bg-white bg-opacity-70 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 shadow-xl p-6 text-left hover:scale-105 transition-all">
              <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl w-14 h-14 flex items-center justify-center mb-4 shadow-lg">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">App Externe</h3>
              <p className="text-sm text-gray-600">URL Azure/Vercel</p>
            </button>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white bg-opacity-95 backdrop-blur-2xl rounded-3xl border border-white border-opacity-20 shadow-2xl max-w-2xl w-full max-h-90vh overflow-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-purple-700">
                    {addMode === 'simple' && '📝 App Simple'}
                    {addMode === 'bolt' && '📦 App Bolt'}
                    {addMode === 'github' && '🔗 GitHub'}
                    {addMode === 'external' && '🌐 App Externe'}
                  </h2>
                  <button onClick={closeModal} className="text-3xl text-gray-500 hover:text-gray-700">×</button>
                </div>

                {addMode === 'simple' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Nom *</label>
                        <input type="text" value={simpleApp.name} onChange={(e) => setSimpleApp({...simpleApp, name: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-purple-200 rounded-xl p-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-2">Icône</label>
                          <input type="text" value={simpleApp.icon} onChange={(e) => setSimpleApp({...simpleApp, icon: e.target.value})} className="w-full bg-white bg-opacity-80 rounded-xl p-3 text-center text-2xl" />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">Couleur</label>
                          <select value={simpleApp.color} onChange={(e) => setSimpleApp({...simpleApp, color: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-purple-200 rounded-xl p-3">
                            {Object.keys(colors).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input type="text" value={simpleApp.description} onChange={(e) => setSimpleApp({...simpleApp, description: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-purple-200 rounded-xl p-3" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Code HTML *</label>
                      <textarea value={simpleApp.htmlContent} onChange={(e) => setSimpleApp({...simpleApp, htmlContent: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-purple-200 rounded-xl p-3 font-mono" rows="10"></textarea>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-700 h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={addSimpleApp} className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-2xl py-4 px-8 font-bold shadow-lg hover:scale-105 transition-transform">✅ Ajouter</button>
                      <button onClick={closeModal} className="bg-gray-200 rounded-2xl py-4 px-8 font-bold hover:bg-gray-300">Annuler</button>
                    </div>
                  </div>
                )}

                {addMode === 'bolt' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Nom *</label>
                        <input type="text" value={boltApp.name} onChange={(e) => setBoltApp({...boltApp, name: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-blue-200 rounded-xl p-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-2">Icône</label>
                          <input type="text" value={boltApp.icon} onChange={(e) => setBoltApp({...boltApp, icon: e.target.value})} className="w-full bg-white bg-opacity-80 rounded-xl p-3 text-center text-2xl" />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">Couleur</label>
                          <select value={boltApp.color} onChange={(e) => setBoltApp({...boltApp, color: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-blue-200 rounded-xl p-3">
                            {Object.keys(colors).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input type="text" value={boltApp.description} onChange={(e) => setBoltApp({...boltApp, description: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-blue-200 rounded-xl p-3" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Fichiers *</label>
                      <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center bg-blue-50 bg-opacity-30">
                        <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-upload-bolt" />
                        <label htmlFor="file-upload-bolt" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                          <p className="font-semibold text-gray-700">Sélectionner fichiers</p>
                          <p className="text-sm text-gray-500 mt-2">/dist/ ou /build/</p>
                        </label>
                        {boltApp.files.length > 0 && <p className="mt-3 font-bold text-green-600">{boltApp.files.length} fichiers</p>}
                      </div>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={addBoltApp} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl py-4 px-8 font-bold shadow-lg hover:scale-105 transition-transform">✅ Uploader</button>
                      <button onClick={closeModal} className="bg-gray-200 rounded-2xl py-4 px-8 font-bold hover:bg-gray-300">Annuler</button>
                    </div>
                  </div>
                )}

                {addMode === 'github' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-yellow-50 bg-opacity-50 border-2 border-yellow-300">
                      <p className="text-sm text-yellow-800">⚠️ Token Vercel requis dans le code</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Nom *</label>
                        <input type="text" value={githubApp.name} onChange={(e) => setGithubApp({...githubApp, name: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-gray-200 rounded-xl p-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-2">Icône</label>
                          <input type="text" value={githubApp.icon} onChange={(e) => setGithubApp({...githubApp, icon: e.target.value})} className="w-full bg-white bg-opacity-80 rounded-xl p-3 text-center text-2xl" />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">Couleur</label>
                          <select value={githubApp.color} onChange={(e) => setGithubApp({...githubApp, color: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-gray-200 rounded-xl p-3">
                            {Object.keys(colors).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input type="text" value={githubApp.description} onChange={(e) => setGithubApp({...githubApp, description: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-gray-200 rounded-xl p-3" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">URL GitHub *</label>
                      <input type="text" value={githubApp.repoUrl} onChange={(e) => setGithubApp({...githubApp, repoUrl: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-gray-200 rounded-xl p-3" placeholder="https://github.com/username/repo" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={deployFromGithub} disabled={githubApp.deploying} className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl py-4 px-8 font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50">
                        {githubApp.deploying ? '⏳ Déploiement...' : '🚀 Déployer'}
                      </button>
                      <button onClick={closeModal} className="bg-gray-200 rounded-2xl py-4 px-8 font-bold hover:bg-gray-300">Annuler</button>
                    </div>
                  </div>
                )}

                {addMode === 'external' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-pink-50 bg-opacity-50 border-2 border-pink-300">
                      <p className="text-sm text-pink-800">🌐 Ajoutez une app hébergée ailleurs (Azure, Vercel, Netlify...)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Nom *</label>
                        <input type="text" value={externalApp.name} onChange={(e) => setExternalApp({...externalApp, name: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-pink-200 rounded-xl p-3" placeholder="Mon App Azure" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-2">Icône</label>
                          <input type="text" value={externalApp.icon} onChange={(e) => setExternalApp({...externalApp, icon: e.target.value})} className="w-full bg-white bg-opacity-80 rounded-xl p-3 text-center text-2xl" />
                        </div>
                        <div>
                          <label className="block font-semibold mb-2">Couleur</label>
                          <select value={externalApp.color} onChange={(e) => setExternalApp({...externalApp, color: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-pink-200 rounded-xl p-3">
                            {Object.keys(colors).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Description</label>
                      <input type="text" value={externalApp.description} onChange={(e) => setExternalApp({...externalApp, description: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-pink-200 rounded-xl p-3" placeholder="Mon application hébergée sur Azure" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">URL Complète *</label>
                      <input type="url" value={externalApp.externalUrl} onChange={(e) => setExternalApp({...externalApp, externalUrl: e.target.value})} className="w-full bg-white bg-opacity-80 border-2 border-pink-200 rounded-xl p-3" placeholder="https://mon-app.azurestaticapps.net" />
                      <p className="text-xs mt-2 text-gray-600">Exemples: Azure, Vercel, Netlify, votre domaine...</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={addExternalApp} className="flex-1 bg-gradient-to-r from-pink-500 to-pink-700 text-white rounded-2xl py-4 px-8 font-bold shadow-lg hover:scale-105 transition-transform">✅ Ajouter</button>
                      <button onClick={closeModal} className="bg-gray-200 rounded-2xl py-4 px-8 font-bold hover:bg-gray-300">Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 font-semibold text-purple-700">Chargement...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white bg-opacity-70 backdrop-blur-lg rounded-3xl p-12 text-center shadow-xl">
            <p className="text-2xl font-bold text-purple-700">Aucune application</p>
            <p className="mt-2 text-gray-600">Ajoutez votre première app ! ☝️</p>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-purple-700">📱 Mes Applications ({apps.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => (
                <div key={app.id} className="bg-white bg-opacity-70 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 shadow-xl overflow-hidden hover:scale-105 transition-all">
                  <div className={`bg-gradient-to-br ${colors[app.color] || colors.purple} p-6`}>
                    <div className="text-5xl mb-3">{app.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
                    {app.app_type && (
                      <span className="bg-white bg-opacity-30 px-3 py-1 rounded-xl text-xs font-bold text-white">
                        {app.app_type === 'html' && '📝 HTML'}
                        {app.app_type === 'react' && '⚛️ React'}
                        {app.app_type === 'vercel' && '▲ Vercel'}
                        {app.app_type === 'external' && '🌐 Externe'}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-sm mb-4 h-12 text-gray-600">{app.description}</p>
                    <div className="flex gap-2">
                      <a href={app.vercel_url || `${SUPABASE_URL}/storage/v1/object/public/${app.storage_path}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 px-6 rounded-xl font-bold text-center shadow-md hover:scale-105 transition-transform">
                        Ouvrir
                      </a>
                      <button onClick={() => deleteApp(app.id)} className="bg-gradient-to-r from-red-500 to-red-700 text-white p-3 rounded-xl shadow-md hover:scale-105 transition-transform">
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

      <footer className="bg-white bg-opacity-50 backdrop-blur-lg border-t border-white border-opacity-20 mt-16 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-purple-700 font-bold">{storeName} © 2025</p>
          <p className="text-sm mt-1 text-gray-600">Powered by Supabase + GitHub + Vercel</p>
        </div>
      </footer>
    </div>
  );
};

export default AmazonToolkitStore;
