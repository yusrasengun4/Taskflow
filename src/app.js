const express = require('express');


const logger = require('../middleware/logger');
const { notFound, errorHandler } = require('../middleware/errorHandler');

const employeeRoutes = require('../routes/employee');
const projectRoutes = require('../routes/project');
const taskRoutes = require('../routes/task');
const assignmentRoutes = require('../routes/assignment');
const app = express();


app.use(logger);
app.use(express.json());

// Rotalar
app.use('/employee', employeeRoutes);
app.use('/project', projectRoutes);
app.use('/task', taskRoutes);
app.use('/assignment', assignmentRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Görev Yönetim Sistemi API is running'
    });
});
// Tanımlanmamış endpoint'leri yakala
app.use(notFound);



// Hataları merkezi olarak yönet
app.use(errorHandler);

module.exports = app;