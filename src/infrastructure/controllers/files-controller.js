const repository = require("../databases/redis");
const ListFiles = require("../../domain/interactors/list-files")(repository);

const FilesController = {
  listFiles: async (req, res) => {
    const path = req.query.fromPath;
    const filesPerPage = req.query.filesPerPage;
    const page = req.query.page;

    if (!path) {
      return res
        .code(400)
        .send({ message: "Required fromPath query param is missing." });
    }

    try {
      const files = await ListFiles(path, page, filesPerPage);

      if (!files) {
        return res.code(200).send({ message: "Path is empty" });
      }

      return files;
    } catch (err) {
      console.error(err);
      if (err.message.includes("no such file or directory")) {
        res.code(400).send({ message: "Path does not exist" });
      } else {
        res.code(500).send({ message: "Error loading files" });
      }
    }
  },
};

module.exports = FilesController;
