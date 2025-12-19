const SECRET_SALT = "ddrive-salt-2025"; // In real apps, use Web Crypto or backend tokens

function encrypt(data) {
  return btoa(JSON.stringify(data) + SECRET_SALT);
}

function decrypt(str) {
  try {
    const raw = atob(str);
    if (!raw.endsWith(SECRET_SALT)) return null;
    return JSON.parse(raw.slice(0, -SECRET_SALT.length));
  } catch {
    return null;
  }
}

const DB_KEYS = {
  AUTH: 'ddrive_auth_v2',
  METRICS: 'ddrive_metrics_v2',
  PILLARS: 'ddrive_pillars_v2',
  AI_HISTORY: 'ddrive_ai_history_v2',
  PREFS: 'ddrive_prefs_v2'
};

// --- Auth (supports any user with known credentials) ---
export const AuthDB = {
  // Predefined users (expand as needed)
  VALID_USERS: {
    'admin@ddrive-m.com': 'resilience2025',
    'analyst@ddrive-m.com': 'monitor2025',
    'viewer@ddrive-m.com': 'viewonly2025'
  },
  save(email) {
    const token = encrypt({ email, ts: Date.now() });
    localStorage.setItem(DB_KEYS.AUTH, token);
  },
  get() {
    const token = localStorage.getItem(DB_KEYS.AUTH);
    if (!token) return null;
    const payload = decrypt(token);
    if (!payload || Date.now() - payload.ts > 30 * 24 * 60 * 60 * 1000) {
      this.clear();
      return null;
    }
    return { email: payload.email, name: payload.email.split('@')[0].replace('.', ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') + " (DDRiVE)" };
  },
  clear() {
    Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  },
  validate(email, password) {
    return this.VALID_USERS[email] === password;
  }
};

// --- Metrics ---
export const MetricsDB = {
  DEFAULT: {
    criticalHazards: 4,
    activeSensors: 1248,
    resilienceScore: 84,
    readinessLevel: 'Alpha',
    uptime: 98.4
  },
  get() {
    const raw = localStorage.getItem(DB_KEYS.METRICS);
    return raw ? decrypt(raw) || this.DEFAULT : this.DEFAULT;
  },
  update(updates) {
    const current = this.get();
    const next = { ...current, ...updates, lastRefresh: Date.now() };
    localStorage.setItem(DB_KEYS.METRICS, encrypt(next));
    return next;
  }
};

// --- Pillars ---
export const PillarDB = {
  DEFAULT: {
    detection: { status: 'active', alerts: 3, lastUpdate: Date.now() },
    diagnostics: { status: 'active', issues: 1, lastUpdate: Date.now() },
    response: { status: 'standby', incidents: 0, lastUpdate: Date.now() },
    integration: { status: 'synced', sources: 12, lastUpdate: Date.now() },
    validation: { status: 'passed', tests: 8, lastUpdate: Date.now() },
    enhancement: { status: 'learning', queries: 0, lastUpdate: Date.now() },
    monitoring: { status: 'tracking', score: 84, lastUpdate: Date.now() }
  },
  getAll() {
    const raw = localStorage.getItem(DB_KEYS.PILLARS);
    return raw ? decrypt(raw) || this.DEFAULT : this.DEFAULT;
  }
};

// --- AI History ---
export const AiHistoryDB = {
  add(prompt, response) {
    const history = this.list();
    history.unshift({ id: crypto.randomUUID(), prompt, response, ts: Date.now() });
    localStorage.setItem(DB_KEYS.AI_HISTORY, encrypt(history.slice(0, 20)));
  },
  list() {
    const raw = localStorage.getItem(DB_KEYS.AI_HISTORY);
    return raw ? decrypt(raw) || [] : [];
  }
};

// --- Preferences ---
export const UserPrefsDB = {
  DEFAULT: { sidebarCollapsed: false },
  get() {
    const raw = localStorage.getItem(DB_KEYS.PREFS);
    return raw ? decrypt(raw) || this.DEFAULT : this.DEFAULT;
  },
  set(updates) {
    const current = this.get();
    const next = { ...current, ...updates };
    localStorage.setItem(DB_KEYS.PREFS, encrypt(next));
    return next;
  }
};
