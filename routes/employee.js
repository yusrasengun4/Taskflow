
const express = require('express');
const router = express.Router();
const { oku, yaz } = require('../utils/dosya');

const calisanDosyasi = 'employee.json';

// GET /employee - Tüm çalışanları getir
router.get('/', (req, res) => {
    try {
        const calisanlar = oku(calisanDosyasi);

        res.json({
            success: true,
            adet: calisanlar.length,
            data: calisanlar
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while fetching employee data'
        });
    }
});

// GET /employee/:id - ID ile çalışan getir
router.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }

        const calisanlar = oku(calisanDosyasi);
        const calisan = calisanlar.find(c => c.emp_id === id);

        if (!calisan) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: calisan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while fetching employee'
        });
    }
});

// POST /employee - Yeni çalışan ekle
router.post('/', (req, res) => {
    try {
        const {
            emp_name,
            emp_position,
            emp_department
        } = req.body;

        if (
            typeof emp_name !== 'string' || !emp_name.trim() ||
            typeof emp_position !== 'string' || !emp_position.trim() ||
            typeof emp_department !== 'string' || !emp_department.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'emp_name, emp_position and emp_department are required'
            });
        }

        const calisanlar = oku(calisanDosyasi);

        const yeniId = calisanlar.length
            ? Math.max(...calisanlar.map(c => c.emp_id)) + 1
            : 1;

        const yeniCalisan = {
            emp_id: yeniId,
            emp_name: emp_name.trim(),
            emp_position: emp_position.trim(),
            emp_department: emp_department.trim()
        };

        calisanlar.push(yeniCalisan);
        yaz(calisanDosyasi, calisanlar);

        res.status(201).json({
            success: true,
            message: 'Employee added successfully',
            data: yeniCalisan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while adding employee'
        });
    }
});

// PUT /employee/:id - Çalışanı güncelle
router.put('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }

        const calisanlar = oku(calisanDosyasi);
        const index = calisanlar.findIndex(c => c.emp_id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const {
            emp_name,
            emp_position,
            emp_department
        } = req.body;

        if (
            emp_name === undefined &&
            emp_position === undefined &&
            emp_department === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'At least one field must be provided'
            });
        }

        if (
            emp_name !== undefined &&
            (typeof emp_name !== 'string' || !emp_name.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee name'
            });
        }

        if (
            emp_position !== undefined &&
            (typeof emp_position !== 'string' || !emp_position.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee position'
            });
        }

        if (
            emp_department !== undefined &&
            (typeof emp_department !== 'string' || !emp_department.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee department'
            });
        }

        if (emp_name !== undefined) {
            calisanlar[index].emp_name = emp_name.trim();
        }

        if (emp_position !== undefined) {
            calisanlar[index].emp_position = emp_position.trim();
        }

        if (emp_department !== undefined) {
            calisanlar[index].emp_department = emp_department.trim();
        }

        yaz(calisanDosyasi, calisanlar);

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: calisanlar[index]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating employee'
        });
    }
});

// DELETE /employee/:id - Çalışanı sil
router.delete('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            });
        }

        const calisanlar = oku(calisanDosyasi);
        const calisan = calisanlar.find(c => c.emp_id === id);

        if (!calisan) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const atamalar = oku('assignment.json');

        // Silinen çalışana ait atamaları kaldır
        const kalanAtamalar = atamalar.filter(
            a => a.emp_id !== id
        );

        // Çalışanı listeden kaldır
        const kalanCalisanlar = calisanlar.filter(
            c => c.emp_id !== id
        );

        yaz('assignment.json', kalanAtamalar);
        yaz(calisanDosyasi, kalanCalisanlar);

        res.json({
            success: true,
            message: 'Employee and their assignments deleted successfully',
            data: {
                emp_id: id,
                emp_name: calisan.emp_name,
                deleted_assignments:
                    atamalar.length - kalanAtamalar.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while deleting employee'
        });
    }
});

module.exports = router;
