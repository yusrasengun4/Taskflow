function notFound(req, res,next) {
    res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON body' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = { notFound, errorHandler };