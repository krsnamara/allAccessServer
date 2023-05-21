
function isAuthenticated(req, res, next){
    if(req.user) return next();
    res.status(401).json({ 
        message: 'You must login first'
    });
}

module.exports = isAuthenticated;