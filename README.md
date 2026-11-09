# Görev Yönetim Sistemi

Node.js ve Express.js ile geliştirilmiş, proje ve görev takibi yapan REST API.


##Kullanılan Teknolijiler

- Node.js
- Express.js
- JSON dosya tabanlı veri saklama
- Postman (test)

##Kurulum ve Çalıştırma

1. Projeyi İndirme

Projeyi GitHub üzerinden klonlayın:

git clone <repo-adresi>

Proje klasörüne gidin:

cd <proje-klasoru>

2. Bağımlılıkların Kurulması

Gerekli paketleri yükleyin:

npm install

3. Sunucunun Başlatılması

src klasörüne geçin:

cd src

Sunucuyu geliştirme modunda başlatın:

node --watch server.js

Sunucu varsayılan olarak aşağıdaki adreste çalışır:

http://localhost:3000

##Klasör Yapısı

```
├── data/          # JSON veri dosyaları
├── middleware/    # logger,hata yakalama
├── routes/        # task, project, employee, assignment
├── utils/         # dosya okuma/yazma yardımcıları
├── logs/          # istek logları (git'e eklenmez)
├── app.js
└── server.js
```

## Geliştirici

Yüsra Şengün
