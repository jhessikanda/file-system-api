const fs = require("fs").promises;
const path = require("path");

const getFilesFromDir = async (dir) => {
  const files = await fs.readdir(dir, {
    withFileTypes: true,
  });

  return files.reduce(async (list, item) => {
    list = await list;

    const fullPath = path.join(dir, item.name);
    const { size } = await fs.stat(fullPath);
    const extension = path.extname(fullPath);

    let result = [{ name: item.name, fullPath, size, extension }];

    if (item.isDirectory()) {
      result = await getFilesFromDir(fullPath);
    }

    return list.concat(result);
  }, Promise.resolve([]));
};

const loadToMemory = async (repository, list, dir) => {
  // EXPIRE KEY IN 1 HOUR
  const setAsync = repository.setAsync();
  const expire = repository.expire();
  await setAsync(dir, JSON.stringify(list));
  await expire(dir, 3600);
};

module.exports = (repository) => async (dir) => {
  const files = await getFilesFromDir(dir);

  if (files.length > 0) {
    await loadToMemory(repository, files, dir);
    return files;
  }

  return null;
};
