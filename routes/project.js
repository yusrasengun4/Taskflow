
const express = require('express');
const router = express.Router();
const { oku, yaz } = require('../utils/dosya');

const projeDosyasi = 'project.json';

const GECERLI_DURUMLAR = [
    'not started',
    'in progress',
    'completed'
];

// GET /project - Tüm projeleri getir
router.get('/', (req, res) => {
    try {
        const projeler = oku(projeDosyasi);

        res.json({
            success: true,
            adet: projeler.length,
            data: projeler
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while fetching project data'
        });
    }
});

// GET /project/:id - ID ile proje getir
router.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });
        }

        const projeler = oku(projeDosyasi);
        const proje = projeler.find(p => p.prj_id === id);

        if (!proje) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            data: proje
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while fetching project'
        });
    }
});

// POST /project - Yeni proje ekle
router.post('/', (req, res) => {
    try {
        const {
            prj_name,
            prj_description,
            prj_start_date
        } = req.body;

        if (
            typeof prj_name !== 'string' || !prj_name.trim() ||
            typeof prj_description !== 'string' || !prj_description.trim() ||
            !prj_start_date
        ) {
            return res.status(400).json({
                success: false,
                message: 'prj_name, prj_description and prj_start_date are required'
            });
        }

        // Tarihin geçerli olup olmadığını kontrol et
        if (Number.isNaN(Date.parse(prj_start_date))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project start date'
            });
        }

        const projeler = oku(projeDosyasi);

        const mevcutMu = projeler.some(
            p => p.prj_name.toLowerCase() === prj_name.trim().toLowerCase()
        );

        if (mevcutMu) {
            return res.status(409).json({
                success: false,
                message: 'Project with the same name already exists'
            });
        }

        const yeniId = projeler.length
            ? Math.max(...projeler.map(p => p.prj_id)) + 1
            : 1;

        const yeniProje = {
            prj_id: yeniId,
            prj_name: prj_name.trim(),
            prj_description: prj_description.trim(),
            prj_start_date,
            prj_end_date: null,
            prj_status: 'not started'
        };

        projeler.push(yeniProje);
        yaz(projeDosyasi, projeler);

        res.status(201).json({
            success: true,
            message: 'Project added successfully',
            data: yeniProje
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while adding project'
        });
    }
});


router.put('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID'
            });
        }

        const projeler = oku(projeDosyasi);
        const index = projeler.findIndex(p => p.prj_id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const {
            prj_name,
            prj_description,
            prj_start_date,
            prj_end_date,
            prj_status
        } = req.body;

        if (
            prj_name === undefined &&
            prj_description === undefined &&
            prj_start_date === undefined &&
            prj_end_date === undefined &&
            prj_status === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'At least one field must be provided'
            });
        }

        if (
            prj_name !== undefined &&
            (typeof prj_name !== 'string' || !prj_name.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project name'
            });
        }

        if (
            prj_description !== undefined &&
            (typeof prj_description !== 'string' || !prj_description.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project description'
            });
        }

        if (
            prj_start_date !== undefined &&
            (typeof prj_start_date !== 'string' ||
                Number.isNaN(Date.parse(prj_start_date)))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project start date'
            });
        }

        if (
            prj_end_date !== undefined &&
            prj_end_date !== null &&
            (typeof prj_end_date !== 'string' ||
                Number.isNaN(Date.parse(prj_end_date)))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project end date'
            });
        }

        if (
            prj_status !== undefined &&
            !GECERLI_DURUMLAR.includes(prj_status)
        ) {
            return res.status(400).json({
                success: false,
                message: `Project status must be one of: ${GECERLI_DURUMLAR.join(', ')}`
            });
        }

        if (
            prj_name !== undefined &&
            projeler.some(p =>
                p.prj_id !== id &&
                p.prj_name.toLowerCase() === prj_name.trim().toLowerCase()
            )
        ) {
            return res.status(409).json({
                success: false,
                message: 'Project with the same name already exists'
            });
        }

        if (prj_name !== undefined) {
            projeler[index].prj_name = prj_name.trim();
        }

        if (prj_description !== undefined) {
            projeler[index].prj_description = prj_description.trim();
        }

        if (prj_start_date !== undefined) {
            projeler[index].prj_start_date = prj_start_date;
        }

        if (prj_end_date !== undefined) {
            projeler[index].prj_end_date = prj_end_date;
        }

        if (prj_status !== undefined) {
            projeler[index].prj_status = prj_status;
        }

        yaz(projeDosyasi, projeler);

        res.json({
            success: true,
            message: 'Project updated successfully',
            data: projeler[index]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating project'
        });
    }
});

module.exports = router;
