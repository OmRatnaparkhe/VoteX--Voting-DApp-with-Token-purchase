import { ethers } from 'ethers';
import Router from 'express';
import jwt from "jsonwebtoken";
const router = Router();

router.post('/authentication', async(req, res)=>{
    try{
       const {accountAddress} = req.query;
       const {signature} = req.body;

       if(!accountAddress || !signature){
        return res.status(400).json({message:"Account address and Signature are required"});
       }

       const message = "Welcome to the Voting DApp! Please sign this message to connect your wallet.";
       const recoveredAddress = ethers.utils.verifyMessage(message, signature);
       
       if(recoveredAddress.toLowerCase() == accountAddress.toLowerCase()){
        const token = jwt.sign({accountAddress}, "secretKey");
        return res.status(200).json({message:"Authentication successful ", token});
       }
       else{
        return res.status(401).json({message:"Authentication failed"});
       }
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
})

export default router;