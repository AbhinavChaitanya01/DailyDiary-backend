const jwt = require('jsonwebtoken');
require('dotenv').config();
const fetchUser =(req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: " Please authenticate a valid token"})
    }
    try {
        const data = jwt.verify(token,process.env.REACT_APP_JWTSECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error: " Please authenticate a valid token"});
    }
}
module.exports = fetchUser;