const express = require('express');
const router = express.Router();
const { oku, yaz } = require('../utils/dosya');


const atamaDosyasi = 'assignment.json';
const gorevDosyasi = 'task.json';
const calisanDosyasi = 'employee.json';




const yeniId = (liste, alan) =>
    liste.length ? Math.max(...liste.map(x => x[alan])) + 1 : 1;

// GET /assignment - Atamaları listele

router.get('/', (req, res) => {
    try {
        let atamalar = oku(atamaDosyasi);
        const { task_id, emp_id } = req.query;

        if (task_id) atamalar = atamalar.filter(a => a.task_id === Number(task_id));
        if (emp_id) atamalar = atamalar.filter(a => a.emp_id === Number(emp_id));

        // Görev ve çalışan bilgilerini birleştir
        const gorevler = oku(gorevDosyasi);
        const calisanlar = oku(calisanDosyasi);
        const detayli = atamalar.map(a => ({
            ...a,
            task: gorevler.find(t => t.task_id === a.task_id) || null,
            employee: calisanlar.find(e => e.emp_id === a.emp_id) || null
        }));

        res.json({ success: true, adet: detayli.length, data: detayli });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while fetching assignments' });
    }
});

// POST /assignment - Göreve bir veya birden fazla çalışan ata

router.post('/', taskValidation, (req, res) => {
    try {
        const { task_id, emp_ids } = req.body;

        if (!task_id || !Array.isArray(emp_ids) || emp_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'task_id and a non-empty emp_ids array are required'
            });
        }

        const taskId = Number(task_id);
        if (!oku(gorevDosyasi).some(t => t.task_id === taskId)) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const calisanlar = oku(calisanDosyasi);
        const empIds = emp_ids.map(Number);

        // Önce hepsini doğrula, hiçbiri geçersizse hiçbirini yazma
        const bulunmayan = empIds.filter(id => !calisanlar.some(e => e.emp_id === id));
        if (bulunmayan.length) {
            return res.status(400).json({
                success: false,
                message: `Employees not found: ${bulunmayan.join(', ')}`
            });
        }

        const atamalar = oku(atamaDosyasi);
        const eklenen = [];
        const zatenAtanmis = [];

        for (const empId of [...new Set(empIds)]) {
            if (atamalar.some(a => a.task_id === taskId && a.emp_id === empId)) {
                zatenAtanmis.push(empId);
                continue;
            }
            const atama = {
                assignment_id: yeniId(atamalar, 'assignment_id'),
                task_id: taskId,
                emp_id: empId,
                assigned_date: new Date().toISOString().slice(0, 10)
            };
            atamalar.push(atama);
            eklenen.push(atama);
        }

        yaz(atamaDosyasi, atamalar);
        res.status(201).json({
            success: true,
            message: 'Assignment completed',
            eklenen,
            zaten_atanmis: zatenAtanmis
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while creating assignment' });
    }
});

// DELETE /assignment/
router.delete('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const atamalar = oku(atamaDosyasi);
        const kalanlar = atamalar.filter(a => a.assignment_id !== id);

        if (kalanlar.length === atamalar.length) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        yaz(atamaDosyasi, kalanlar);
        res.json({ success: true, message: 'Assignment removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while removing assignment' });
    }
});

module.exports = router;