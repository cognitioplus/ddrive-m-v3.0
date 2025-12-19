const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the repository root
app.use(express.static(path.join(__dirname, '/')));

// Handle PWA routing (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`DDRiVE-M Platform running at http://localhost:${PORT}`);
});
