const { createProxyMiddleware } = require('http-proxy-middleware');
const Workspace = require('../models/Workspace')
module.exports = createProxyMiddleware({
  target: 'http://dummy', // dummy, will be overridden
  changeOrigin: true,
  router: (req) => {
    const workspaceId = extractWorkspaceIdFrom(req,res);
    return `http://${workspaceId}.cloudide.internal`;
  }
});


async function extractWorkspaceIdFrom(req,res){
  const user=req?.user
  const id=req.params
  const workspace = await Workspace.findById(id)
  if(!workspace){
   return res.status(401).json({message:'Workspace doesnt exist'})
  }
  if(workspace.user!==user._id){
    return res.status(401).json({message:'Cannot access the Workspace'})
  }
  return workspace.user
}