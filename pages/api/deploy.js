// pages/api/deploy.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { repoUrl, appName } = req.body;

  if (!repoUrl || !appName) {
    return res.status(400).json({ error: 'repoUrl et appName requis' });
  }

  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    return res.status(400).json({ error: 'URL GitHub invalide' });
  }
  const [, owner, repo] = match;

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  if (!VERCEL_TOKEN) {
    return res.status(500).json({ error: 'Token Vercel non configuré dans les variables d’environnement' });
  }

  try {
    const vercelRes = await fetch('https://api.vercel.com/v10/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: appName.toLowerCase().replace(/\s+/g, '-'),
        gitRepository: { type: 'github', repo: `${owner}/${repo}` },
        framework: 'nextjs'
      })
    });

    if (!vercelRes.ok) {
      const errorText = await vercelRes.text();
      console.error('Erreur Vercel:', errorText);
      return res.status(500).json({ error: 'Échec du déploiement sur Vercel' });
    }

    const vercelData = await vercelRes.json();
    const vercelUrl = `https://${vercelData.name}.vercel.app`;

    res.status(200).json({ success: true, url: vercelUrl });
  } catch (error) {
    console.error('Erreur déploiement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
