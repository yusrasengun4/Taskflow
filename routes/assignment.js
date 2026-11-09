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

// GET /assignment/:id - ID ile getir
router.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ success: false, message: 'id must be a positive integer' });
        }

        const atama = oku(atamaDosyasi).find(a => a.assignment_id === id);
        if (!atama) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

       
        const gorev = oku(gorevDosyasi).find(t => t.task_id === atama.task_id) || null;
        const calisan = oku(calisanDosyasi).find(e => e.emp_id === atama.emp_id) || null;

        res.json({
            success: true,
            data: { ...atama, task: gorev, employee: calisan }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while fetching assignment' });
    }
});
// POST /assignment - Göreve bir veya birden fazla çalışan ata

router.post('/',  (req, res) => {
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
// PUT /assignment/:id - Atamayı güncelle

router.put('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ success: false, message: 'id must be a positive integer' });
        }

        const { task_id, emp_id, assigned_date } = req.body;

        if (task_id === undefined && emp_id === undefined && assigned_date === undefined) {
            return res.status(400).json({
                success: false,
                message: 'At least one of task_id, emp_id, assigned_date is required'
            });
        }

        // Gönderilen alanların biçimini kontrol et
        if (task_id !== undefined && !Number.isInteger(Number(task_id))) {
            return res.status(400).json({ success: false, message: 'task_id must be a number' });
        }
        if (emp_id !== undefined && !Number.isInteger(Number(emp_id))) {
            return res.status(400).json({ success: false, message: 'emp_id must be a number' });
        }
        if (assigned_date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(assigned_date)) {
            return res.status(400).json({ success: false, message: 'assigned_date must be in YYYY-MM-DD format' });
        }

        const atamalar = oku(atamaDosyasi);
        const mevcut = atamalar.find(a => a.assignment_id === id);
        if (!mevcut) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        const yeniTaskId = task_id !== undefined ? Number(task_id) : mevcut.task_id;
        const yeniEmpId = emp_id !== undefined ? Number(emp_id) : mevcut.emp_id;

        // Görev ve çalışan gerçekten var mı
        if (!oku(gorevDosyasi).some(t => t.task_id === yeniTaskId)) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        if (!oku(calisanDosyasi).some(e => e.emp_id === yeniEmpId)) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Aynı görev + çalışan çifti başka bir kayıtta var mı
        const cakisma = atamalar.some(a =>
            a.assignment_id !== id &&
            a.task_id === yeniTaskId &&
            a.emp_id === yeniEmpId
        );
        if (cakisma) {
            return res.status(409).json({
                success: false,
                message: 'This employee is already assigned to this task'
            });
        }

        mevcut.task_id = yeniTaskId;
        mevcut.emp_id = yeniEmpId;
        if (assigned_date !== undefined) mevcut.assigned_date = assigned_date;

        yaz(atamaDosyasi, atamalar);
        res.json({ success: true, message: 'Assignment updated successfully', data: mevcut });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while updating assignment' });
    }
});

module.exports = router;