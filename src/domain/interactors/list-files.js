const LoadFiles = require("./load-files");

module.exports = (repository) => async (
  dir,
  page = 1,
  maxResultPerPage = 100
) => {
  const getAsync = repository.getAsync();
  let files = await getAsync(dir);
  files = JSON.parse(files);

  if (!files) {
    files = await LoadFiles(repository)(dir);

    if (!files) {
      return null;
    }

    console.info(`Loaded ${files.length} files to system`);
  }

  const start = (page - 1) * maxResultPerPage;
  const end = start + maxResultPerPage;

  const subArray = files.slice(start, end);

  let totalPages = 1;

  if (files.length > maxResultPerPage) {
    totalPages = Math.floor(files.length / maxResultPerPage);
  }

  return {
    path: dir,
    page: parseInt(page),
    totalPages,
    totalElements: files.length,
    filesPerPage: maxResultPerPage,
    files: subArray,
  };
};
