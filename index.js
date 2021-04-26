const server = require("./src/infrastructure/webserver/fastfy")();
const LOCALHOST = "0.0.0.0";

server.setNotFoundHandler((req, res) =>
  res.status(404).send({ message: "No such route!" })
);

server.listen(3000, LOCALHOST, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
