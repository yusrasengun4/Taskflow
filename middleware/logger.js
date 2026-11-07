const fs = require('fs');
const path = require('path');

const logKlasoru = path.join(__dirname, '..', 'logs');
const logDosyasi = path.join(logKlasoru, 'requests.log');

// Klasör yoksa uygulama başlarken bir kez oluştur
if (!fs.existsSync(logKlasoru)) {
    fs.mkdirSync(logKlasoru, { recursive: true });
}

function requestLogger(req, res, next) {
    const baslangic = Date.now();

    res.on('finish', () => {
        const sure = Date.now() - baslangic;
        const satir = `${new Date().toISOString()} | ${req.method} | ${req.originalUrl} | ${res.statusCode} | ${sure}ms\n`;

        fs.appendFile(logDosyasi, satir, (err) => {
            if (err) console.error('Log yazılamadı:', err.message);
        });
    });

    next();
}

module.exports = requestLogger;