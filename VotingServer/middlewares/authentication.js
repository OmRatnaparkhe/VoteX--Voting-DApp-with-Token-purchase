import jwt from "jsonwebtoken";

const authentication = (req,res,next) => {
    try{
        const token = req.headers['x-access-token'];
        if(!token){
            return res.status(401).json({message:"Authentication failed: token missing"});
        }
        const decoded = jwt.verify(token, 'secretKey');
        console.log(decoded);
        req.accountAddress = decoded.accountAddress;
        next();
    }
    catch(error){
        console.error(error);
    }
}

export default authentication;