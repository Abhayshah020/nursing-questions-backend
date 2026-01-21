module.exports = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        return next(); // Admin bypass
    }

    // if (!req.user.permissions || !req.user.permissions[permission]) {
    //     return res.status(403).json({
    //         message: 'Permission denied'
    //     });
    // }

    return res.status(403).json({
        message: 'Permission denied'
    });
};
