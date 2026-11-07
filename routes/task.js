const express = require('express');
const router = express.Router();
const { oku, yaz } = require('../utils/dosya');


const gorevDosyasi = 'task.json';
const projeDosyasi = 'project.json';

const GECERLI_ONCELIKLER = ['low', 'medium', 'high'];
const GECERLI_DURUMLAR = ['not started', 'in progress', 'completed'];


// GET /task - Tüm görevleri getir
router.get('/', (req, res) => {
    try {
        const tasks = oku(gorevDosyasi);
        res.json({ success: true, adet: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while fetching tasks' });
    }
});

// GET /task/:id - Tek görev getir
router.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }
        const task = oku(gorevDosyasi).find(t => t.task_id === id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while fetching task' });
    }
});

// POST /task - Yeni görev oluştur
router.post('/', (req, res) => {
    try {
        const {
            prj_id, task_name, task_description,
            task_priority, task_start_date, task_status
        } = req.body;

        if (!prj_id || !task_name || !task_priority) {
            return res.status(400).json({
                success: false,
                message: 'prj_id, task_name and task_priority are required'
            });
        }
        if (!GECERLI_ONCELIKLER.includes(task_priority)) {
            return res.status(400).json({
                success: false,
                message: `task_priority must be one of: ${GECERLI_ONCELIKLER.join(', ')}`
            });
        }
        if (task_status && !GECERLI_DURUMLAR.includes(task_status)) {
            return res.status(400).json({
                success: false,
                message: `task_status must be one of: ${GECERLI_DURUMLAR.join(', ')}`
            });
        }

        const projeler = oku(projeDosyasi);
        if (!projeler.some(p => p.prj_id === Number(prj_id))) {
            return res.status(400).json({ success: false, message: 'Project does not exist' });
        }

        const tasks = oku(gorevDosyasi);
        const yeniTask = {
            task_id: tasks.length ? Math.max(...tasks.map(t => t.task_id)) + 1 : 1,
            prj_id: Number(prj_id),
            task_name,
            task_description: task_description || '',
            task_priority,
            task_start_date: task_start_date || null,
            task_end_date: null,
            task_status: task_status || 'not started'
        };

        tasks.push(yeniTask);
        yaz(gorevDosyasi, tasks);
        res.status(201).json({ success: true, message: 'Task added successfully', data: yeniTask });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while adding task' });
    }
});

// PUT /task/:id - Görev güncelle
router.put('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }
        const tasks = oku(gorevDosyasi);
        const index = tasks.findIndex(t => t.task_id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const { task_priority, task_status } = req.body;
        if (task_priority && !GECERLI_ONCELIKLER.includes(task_priority)) {
            return res.status(400).json({ success: false, message: 'Invalid task_priority' });
        }
        if (task_status && !GECERLI_DURUMLAR.includes(task_status)) {
            return res.status(400).json({ success: false, message: 'Invalid task_status' });
        }

        // Sadece izin verilen alanlar güncellenir (task_id değiştirilemez)
        const izinliAlanlar = ['task_name', 'task_description', 'task_priority',
                               'task_start_date', 'task_end_date', 'task_status'];
        izinliAlanlar.forEach(alan => {
            if (req.body[alan] !== undefined) tasks[index][alan] = req.body[alan];
        });

        yaz(gorevDosyasi, tasks);
        res.json({ success: true, message: 'Task updated successfully', data: tasks[index] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while updating task' });
    }
});

// DELETE /task/:id - Görev sil
router.delete('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }
        const tasks = oku(gorevDosyasi);
        const kalanlar = tasks.filter(t => t.task_id !== id);

        if (kalanlar.length === tasks.length) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        yaz(gorevDosyasi, kalanlar);
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error occurred while deleting task' });
    }
});

module.exports = router;