// Constants
const DB_KEYS = {
  AUTH_TOKEN: 'ddrive_auth_token',
  USER_INFO: 'ddrive_user_info',
  PILLAR_DATA: 'ddrive_pillar_data',
  METRICS: 'ddrive_metrics',
  AI_HISTORY: 'ddrive_ai_history',
  USER_PREFS: 'ddrive_user_prefs'
};

// Base utility
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function safeJsonStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}

// ---- Authentication ----
export const AuthDB = {
  save(user) {
    const token = btoa(JSON.stringify({ email: user.email, ts: Date.now() }));
    localStorage.setItem(DB_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(DB_KEYS.USER_INFO, safeJsonStringify(user));
  },
  get() {
    const token = localStorage.getItem(DB_KEYS.AUTH_TOKEN);
    const userInfo = safeJsonParse(localStorage.getItem(DB_KEYS.USER_INFO));
    if (!token || !userInfo) return null;

    try {
      const payload = JSON.parse(atob(token));
      if (Date.now() - payload.ts > 30 * 24 * 60 * 60 * 1000) {
        this.clear();
        return null;
      }
      return userInfo;
    } catch {
      this.clear();
      return null;
    }
  },
  clear() {
    Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

// ---- Pillar Telemetry (for each of the 7 DDRiVE pillars) ----
export const PillarDB = {
  initialize() {
    if (!localStorage.getItem(DB_KEYS.PILLAR_DATA)) {
      const initial = {
        detection: { status: 'active', lastUpdate: Date.now(), alerts: 3 },
        diagnostics: { status: 'active', lastUpdate: Date.now(), issues: 1 },
        response: { status: 'standby', lastUpdate: Date.now(), incidents: 0 },
        integration: { status: 'synced', lastUpdate: Date.now(), sources: 12 },
        validation: { status: 'passed', lastUpdate: Date.now(), tests: 8 },
        enhancement: { status: 'learning', lastUpdate: Date.now(), queries: 0 },
        monitoring: { status: 'tracking', lastUpdate: Date.now(), score: 84 }
      };
      localStorage.setItem(DB_KEYS.PILLAR_DATA, safeJsonStringify(initial));
    }
  },
  getAll() {
    this.initialize();
    return safeJsonParse(localStorage.getItem(DB_KEYS.PILLAR_DATA)) || {};
  },
  update(pillarId, data) {
    const all = this.getAll();
    all[pillarId] = { ...all[pillarId], ...data, lastUpdate: Date.now() };
    localStorage.setItem(DB_KEYS.PILLAR_DATA, safeJsonStringify(all));
    return all[pillarId];
  }
};

// ---- System Metrics (Resilience Score, Sensors, etc.) ----
export const MetricsDB = {
  initialize() {
    if (!localStorage.getItem(DB_KEYS.METRICS)) {
      const initial = {
        criticalHazards: 4,
        activeSensors: 1248,
        resilienceScore: 84,
        readinessLevel: 'Alpha',
        uptime: 98.4,
        lastRefresh: Date.now()
      };
      localStorage.setItem(DB_KEYS.METRICS, safeJsonStringify(initial));
    }
  },
  get() {
    this.initialize();
    return safeJsonParse(localStorage.getItem(DB_KEYS.METRICS)) || {};
  },
  update(updates) {
    const current = this.get();
    const updated = { ...current, ...updates, lastRefresh: Date.now() };
    localStorage.setItem(DB_KEYS.METRICS, safeJsonStringify(updated));
    return updated;
  }
};

// ---- AI Query History ----
export const AiHistoryDB = {
  initialize() {
    if (!localStorage.getItem(DB_KEYS.AI_HISTORY)) {
      localStorage.setItem(DB_KEYS.AI_HISTORY, '[]');
    }
  },
  add(prompt, response) {
    this.initialize();
    const history = safeJsonParse(localStorage.getItem(DB_KEYS.AI_HISTORY)) || [];
    history.unshift({ id: crypto.randomUUID(), prompt, response, ts: Date.now() });
    // Keep only last 20
    const trimmed = history.slice(0, 20);
    localStorage.setItem(DB_KEYS.AI_HISTORY, safeJsonStringify(trimmed));
  },
  list() {
    this.initialize();
    return safeJsonParse(localStorage.getItem(DB_KEYS.AI_HISTORY)) || [];
  }
};

// ---- User Preferences ----
export const UserPrefsDB = {
  initialize() {
    if (!localStorage.getItem(DB_KEYS.USER_PREFS)) {
      localStorage.setItem(DB_KEYS.USER_PREFS, safeJsonStringify({ sidebarCollapsed: false }));
    }
  },
  get() {
    this.initialize();
    return safeJsonParse(localStorage.getItem(DB_KEYS.USER_PREFS)) || {};
  },
  set(updates) {
    const current = this.get();
    const next = { ...current, ...updates };
    localStorage.setItem(DB_KEYS.USER_PREFS, safeJsonStringify(next));
    return next;
  }
};
