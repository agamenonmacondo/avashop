import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Try several env names (safe: we only log source and length)
const KEY_CANDIDATES = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_KEY',
  'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY'
] as const;

let SUPABASE_SERVICE_KEY = '';
let usedKeyName = '';
for (const name of KEY_CANDIDATES) {
  if (process.env[name]) {
    SUPABASE_SERVICE_KEY = process.env[name] as string;
    usedKeyName = name;
    break;
  }
}
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (usedKeyName) {
  console.log('Using Supabase key from env:', usedKeyName, 'length:', SUPABASE_SERVICE_KEY.length);
} else {
  console.warn('No Supabase service key env found, falling back to anon key (read-only).');
}

// Use the service role key explicitly on the server. Do NOT expose this to the client.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON, {
  auth: { persistSession: false },
});

const FIREBASE_KEY_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(process.cwd(), 'ava-agente-firebase-adminsdk-fbsvc-c919f728cd.json');

function loadServiceAccountFile(filePath: string): admin.ServiceAccount | null {
  try {
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(absPath)) {
      console.warn('Firebase service account file not found at', absPath);
      return null;
    }
    const raw = fs.readFileSync(absPath, 'utf8');
    return JSON.parse(raw) as admin.ServiceAccount;
  } catch (err) {
    console.error('Failed to load/parse firebase service account file:', err);
    return null;
  }
}

const serviceAccountKey = loadServiceAccountFile(FIREBASE_KEY_PATH);

if (!admin.apps.length && serviceAccountKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
    });
    console.log('Firebase Admin initialized from file:', FIREBASE_KEY_PATH);
  } catch (e) {
    console.error('Failed to initialize Firebase Admin from file:', e);
  }
}

// helper: verify token only if admin initialized
async function getUserFromIdToken(idToken?: string): Promise<{ uid: string; email: string | null } | null> {
  if (!idToken) return null;
  if (!admin.apps.length) {
    // no admin -> can't verify token
    console.warn('Firebase Admin not initialized, cannot verify token');
    return null;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email || null };
  } catch (err) {
    console.warn('Failed to verify idToken:', (err as any)?.message || err);
    return null;
  }
}

interface ProfilePayload {
  name: string;
  phone?: string;
}

interface RequestBody {
  type: 'getProfile' | 'profile';
  payload?: ProfilePayload;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validaciones de entorno críticas
    if (!SUPABASE_URL) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
      return res.status(500).json({ error: 'Server misconfiguration: missing SUPABASE URL' });
    }
    if (!SUPABASE_SERVICE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY (use a server-side key for writes)');
      return res.status(500).json({ error: 'Server misconfiguration: missing SUPABASE_SERVICE_ROLE_KEY' });
    }
    if (!admin.apps.length) {
      console.error('Firebase Admin not initialized - check FIREBASE_SERVICE_ACCOUNT_PATH');
      return res.status(500).json({ error: 'Server misconfiguration: Firebase Admin not initialized' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, payload } = req.body as RequestBody;
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!idToken) {
      return res.status(401).json({ error: 'Missing Authorization Bearer token' });
    }

    const user = await getUserFromIdToken(idToken);
    if (!user) {
      return res.status(401).json({ error: 'Invalid idToken or Firebase Admin not configured' });
    }

    // GET PROFILE
    if (type === 'getProfile') {
      // busca por email primero, luego por uid
      const idCandidates = [user.email, user.uid].filter(Boolean) as string[];
      for (const id of idCandidates) {
        const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', id).maybeSingle();
        if (error) {
          console.error('[api/profile] supabase select error:', error.message || error);
          return res.status(500).json({ error: 'Database error' });
        }
        if (data) {
          return res.status(200).json({ profile: data });
        }
      }
      return res.status(200).json({ profile: null });
    }

    // CREATE/UPSERT PROFILE
    if (type === 'profile') {
      const id = user.email ?? user.uid;
      if (!id) {
        return res.status(400).json({ error: 'Could not determine id from token' });
      }

      const { name, phone } = payload || {};
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Invalid name' });
      }

      const { error } = await supabaseAdmin.from('profiles').upsert(
        {
          id,
          name,
          phone: phone ?? '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error('[api/profile] supabase upsert error:', error.message || error);
        return res.status(500).json({ error: 'Database error' });
      }

      return res.status(200).json({ success: true });
    }

    // Si el tipo no es reconocido
    return res.status(400).json({ error: 'Invalid request type' });

  } catch (err) {
    console.error('[api/profile] Unexpected error:', (err as any)?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}