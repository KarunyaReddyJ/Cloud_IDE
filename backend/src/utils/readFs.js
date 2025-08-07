
const fs = require('fs').promises;
const path = require('path');

const readFs = async (m_path,name) => {
  const stats = await fs.lstat(m_path);
  const obj = {
    id:m_path,
    isDir: stats.isDirectory(),
    name,
    children: []
  };

  if (obj.isDir) {
    const children = await fs.readdir(m_path);
    for (const child of children) {
      obj.children.push(await readFs(path.join(m_path,child),child))
    }
  }

  return obj;
};

module.exports={readFs}