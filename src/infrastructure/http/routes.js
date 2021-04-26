const FilesController = require("../controllers/files-controller");

const routes = [
  {
    method: "GET",
    path: "/files",
    schema: {
      querystring: {
        fromPath: { type: "string" },
      },
    },
    handler: FilesController.listFiles,
  },
];

module.exports = routes;
