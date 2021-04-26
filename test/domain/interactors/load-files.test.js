const { expect } = require("chai");
const chai = require("chai");
const { stub, restore } = require("sinon");
const chaiAsPromised = require("chai-as-promised");
const LoadFiles = require("../../../src/domain/interactors/load-files");
const redis = require("../../../src/infrastructure/databases/redis");
const mockFs = require("mock-fs");

const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);

let redisSetAsyncMock;
let redisExpireMock;

const expectedLoadFilesSuccess = [
  {
    name: "a.js",
    fullPath: "/Users/default/Projects/nodejs/a.js",
    size: 17,
    extension: ".js",
  },
  {
    name: "image.png",
    fullPath: "/Users/default/Projects/nodejs/assets/image.png",
    size: 7,
    extension: ".png",
  },
  {
    name: "b.txt",
    fullPath: "/Users/default/Projects/nodejs/b.txt",
    size: 17,
    extension: ".txt",
  },
];

describe("Load files use case test", () => {
  beforeEach(() => {
    mockFs({
      "/Users/default/Projects/nodejs": {
        "a.js": "file content here",
        "b.txt": "file content here",
        "empty-dir": {},
        assets: {
          "image.png": Buffer.from([8, 6, 7, 5, 3, 0, 9]),
        },
      },

      "some/other/empty/path": {},
    });
  });

  afterEach(() => {
    restore();
    mockFs.restore();
    redisExpireMock.reset();
    redisSetAsyncMock.reset();
  });

  it("Load files sucessful response test", async () => {
    const dir = "/Users/default/Projects/nodejs";

    redisExpireMock = stub(redis, "expire").returns(() => true);
    redisSetAsyncMock = stub(redis, "setAsync").returns(() => true);

    const result = await LoadFiles(redis)(dir);

    expect(result.length).to.be.equals(3);
    expect(result).to.be.deep.equal(expectedLoadFilesSuccess);
  });

  it("Load files successful and set response to redis test", async () => {
    const dir = "/Users/default/Projects/nodejs";

    redisExpireMock = stub(redis, "expire").returns(() => true);
    redisSetAsyncMock = stub(redis, "setAsync").returns(() => true);

    await LoadFiles(redis)(dir);

    expect(redisSetAsyncMock).to.have.been.calledOnce;
    expect(redisExpireMock).to.have.been.calledOnce;
  });

  it("Load files from empty path", async () => {
    const dir = "some/other/empty/path";

    redisExpireMock = stub(redis, "expire").returns(() => true);
    redisSetAsyncMock = stub(redis, "setAsync").returns(() => true);

    const result = await LoadFiles(redis)(dir);
    expect(result).to.be.null;
  });
});
