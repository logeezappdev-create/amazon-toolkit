import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Upload,
  RefreshCw,
  Trash2,
  ExternalLink,
  Code,
  Package,
  Github,
  Globe,
  Settings,
  Edit2,
  Check,
  X
} from 'lucide-react';

// ✅ Utilisation des variables d'environnement Vercel (côté client)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN || ''; // ⚠️ Attention : exposer un token Vercel côté client est risqué (voir note ci-dessous)

const AmazonToolkitStore = () => {
  // ... (le reste du code reste identique jusqu'au composant JSX)

  // 🔴 ATTENTION : Le déploiement via Vercel API depuis le frontend expose ton token.
  // Pour plus de sécurité, déplace cette logique dans une API route côté serveur (Next.js API).

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #F3E8FF 0%, #DBEAFE 50%, #FCE7F3 100%)'
    }}>
      {/* ... header ... */}

      {/* Dans le bouton "App Externe", remplace LinkIcon par ExternalLink */}
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
        <ExternalLink className="w-7 h-7 text-white" /> {/* ✅ Corrigé */}
      </div>

      {/* ... reste du JSX ... */}

      {/* Dans le rendu des apps, sécurise l'URL */}
      <a
        href={
          app.app_type === 'external' || app.app_type === 'vercel'
            ? app.vercel_url
            : `${SUPABASE_URL}/storage/v1/object/public/${app.storage_path}`
        }
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

      {/* ... footer ... */}
    </div>
  );
};

export default AmazonToolkitStore;
