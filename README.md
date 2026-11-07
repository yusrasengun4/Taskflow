# Görev Yönetim Sistemi

Node.js ve Express.js ile geliştirilmiş, proje ve görev takibi yapan REST API.

## Proje Senaryosu

Bir ekip, birden fazla projeyi aynı anda yürütmektedir. Her projenin altında yapılması gereken görevler bulunur ve bu görevler ekipteki çalışanlara dağıtılır. Şu anda bu takip dağınık şekilde (not, mesaj, tablo) yapıldığı için şu sorunlar yaşanmaktadır:

- Hangi görevin kimde olduğu belli değildir.
- Görevlerin ne durumda olduğu (başlamadı, devam ediyor, tamamlandı) takip edilemez.
- Bir görevin durumunun ne zaman değiştiği bilinmez.
- Aynı görev üzerinde birden fazla kişinin çalışması yönetilemez.

Bu proje, söz konusu ihtiyaçları karşılamak için görevlerin tek bir yerden oluşturulup, çalışanlara atanıp, durumlarının izlenebildiği bir arka uç (backend) servisi sunar.

## Projenin Amacı

- Proje ve görev bilgilerini merkezi bir yapıda tutmak
- Görevlerin oluşturulması, listelenmesi, güncellenmesi ve silinmesi (CRUD) işlemlerini sağlamak
- Görevlerin bir veya birden fazla çalışana atanmasını mümkün kılmak
- Görev durumlarının kurallı biçimde değişmesini ve geçmişinin tutulmasını sağlamak
- Gelen tüm API isteklerini kayıt altına alarak izlenebilirlik sağlamak
- Express.js ile katmanlı (route, middleware, yardımcı fonksiyonlar) bir REST API mimarisi uygulamak

## Sistem Özellikleri

**Görev yönetimi**
- Görev ekleme, listeleme, detay görüntüleme, güncelleme ve silme
- Görev önceliği: `low`, `medium`, `high`
- Duruma, projeye ve çalışana göre filtreleme

**Atama yönetimi**
- Bir göreve bir veya birden fazla çalışan atama
- Bir çalışanın birden fazla görevde yer alabilmesi
- Aynı çalışanın aynı göreve tekrar atanmasının engellenmesi
- Atamaların görev ve çalışan bilgileriyle birlikte listelenmesi

**Durum takibi**
- Durumlar: `not started`, `in progress`, `completed`
- Yalnızca izin verilen geçişlere müsaade edilir (örn. başlamamış görev doğrudan tamamlandı yapılamaz)
- Görev tamamlanınca bitiş tarihi otomatik yazılır
- Her durum değişikliği tarih bilgisiyle geçmişe kaydedilir

**Altyapı**
- İstek doğrulama (validation) middleware'i: eksik veya hatalı veri 400 hatasıyla reddedilir
- Request logger: tüm istekler (metot, URL, durum kodu, süre) `logs/requests.log` dosyasına yazılır
- Merkezi hata yönetimi (tanımsız rota ve bozuk JSON dahil)
- Veriler JSON dosyalarında saklanır

## Kullanılan Teknolojiler

- Node.js
- Express.js
- JSON dosya tabanlı veri saklama
- Postman (test)

## Kurulum

```bash
git clone <repo-adresi>
cd <proje-klasoru>
npm install
npm run dev
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır. Port, `PORT` ortam değişkeniyle değiştirilebilir.

## Endpointler

### Görev

| Metot | Endpoint | Açıklama |
|---|---|---|
| GET | `/task` | Görevleri listele (`?status=`, `?prj_id=`, `?emp_id=`) |
| GET | `/task/:id` | Görev detayı |
| POST | `/task` | Yeni görev ekle |
| PUT | `/task/:id` | Görevi güncelle |
| DELETE | `/task/:id` | Görevi sil |
| PATCH | `/task/:id/status` | Görev durumunu değiştir |
| GET | `/task/:id/history` | Durum geçmişi |

### Atama

| Metot | Endpoint | Açıklama |
|---|---|---|
| GET | `/assignment` | Atamaları listele (`?task_id=`, `?emp_id=`) |
| POST | `/assignment` | Göreve çalışan ata |
| DELETE | `/assignment/:id` | Atamayı kaldır |

### Proje ve Çalışan

| Metot | Endpoint | Açıklama |
|---|---|---|
| GET, POST | `/project` | Projeleri listele, yeni proje ekle |
| GET, POST | `/employee` | Çalışanları listele, yeni çalışan ekle |

## Örnek İstekler

**Görev ekleme** `POST /task`
```json
{
    "prj_id": 1,
    "task_name": "Login sayfasını yaz",
    "task_priority": "high",
    "task_start_date": "2026-10-22"
}
```

**Çalışan atama** `POST /assignment`
```json
{
    "task_id": 1,
    "emp_ids": [1, 2]
}
```

**Durum değiştirme** `PATCH /task/1/status`
```json
{
    "task_status": "in progress"
}
```

## Klasör Yapısı

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
