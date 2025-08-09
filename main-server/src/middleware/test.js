
const testMiddleware=async(req,res,next)=>{
    console.log('reached: ',req.originalUrl)
    console.log('params',req.params.id)
    next()
}

module.exports=testMiddleware