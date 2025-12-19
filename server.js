const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Security & Performance Headers (optional but recommended)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// Serve static assets (HTML, JS, JSON, images, etc.)
app.use(express.static(path.join(__dirname, '.'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true
}));

// SPA Fallback: All routes serve index.html (for PWA client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      // If index.html is missing, send a simple error
      res.status(404).send('DDRiVE-M Platform: index.html not found');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ DDRiVE-M Platform running at http://localhost:${PORT}`);
  console.log(`   Files served from: ${__dirname}`);
});
