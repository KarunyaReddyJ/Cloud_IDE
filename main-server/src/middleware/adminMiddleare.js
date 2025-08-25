
function adminMiddleware(req, res, next) {
    try {
        const user = req.user
        if (user.role === 'admin')
            next();
        return res.status(401).json({ message: "Only admins allowed" })
    } catch (err) {
       return res.status(401).json({ error: 'Invalid token',message:err.message });
    }
}

module.exports = adminMiddleware;
