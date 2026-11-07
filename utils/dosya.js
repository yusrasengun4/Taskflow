const fs = require('fs');
const path = require('path');

const veriKlasoru = path.join(__dirname, '..', 'data');

// JSON dosyasını oku
function oku(dosyaAdi) {
    const dosyaYolu = path.join(veriKlasoru, dosyaAdi);

    if (!fs.existsSync(dosyaYolu)) {
        return [];
    }

    const icerik = fs.readFileSync(dosyaYolu, 'utf8').trim();
    if (!icerik) {
        return [];
    }

    return JSON.parse(icerik);
}

// JSON dosyasına yaz
function yaz(dosyaAdi, veri) {
    if (!fs.existsSync(veriKlasoru)) {
        fs.mkdirSync(veriKlasoru, { recursive: true });
    }

    const dosyaYolu = path.join(veriKlasoru, dosyaAdi);
    fs.writeFileSync(dosyaYolu, JSON.stringify(veri, null, 4), 'utf8');
}

module.exports = { oku, yaz };