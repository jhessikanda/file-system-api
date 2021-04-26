const { expect } = require("chai");
const chai = require("chai");
const { restore } = require("sinon");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const chaiAsPromised = require("chai-as-promised");
const ListFiles = require("../../../src/domain/interactors/list-files");
const redis = require("../../../src/infrastructure/databases/redis");

const sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(chaiAsPromised);

let loadFilesMock = sinon.stub();
let redisGetMock;

// Workaround to mock LoadFiles as default export module
const ListFilesMockedDependency = proxyquire(
  "../../../src/domain/interactors/list-files",
  {
    "../../../src/domain/interactors/load-files": () => loadFilesMock,
  }
);

const expectedGetResponse = [
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

const expectedListFilesResponse = (dir, jsonResponse) => ({
  path: dir,
  page: 1,
  totalPages: 1,
  totalElements: jsonResponse.length,
  filesPerPage: 100,
  files: jsonResponse,
});

describe("List files use case test", () => {
  afterEach(() => {
    restore();
    loadFilesMock.reset();
    redisGetMock.reset();
  });

  it("List files sucessful from Redis test", async () => {
    const dir = "/Users/default/Projects/nodejs";

    redisGetMock = sinon
      .stub(redis, "getAsync")
      .returns(() => JSON.stringify(expectedGetResponse));

    const result = await ListFiles(redis)(dir);

    expect(result).to.be.deep.equal(
      expectedListFilesResponse(dir, expectedGetResponse)
    );
    expect(redisGetMock).to.have.been.calledOnce;
  });

  it("List files sucessful from file system test", async () => {
    const dir = "/Users/default/Projects/nodejs";

    redisGetMock = sinon.stub(redis, "getAsync").returns(() => null);

    loadFilesMock.resolves(expectedGetResponse);

    const result = await ListFilesMockedDependency(redis)(dir);

    expect(result).to.be.deep.equal(
      expectedListFilesResponse(dir, expectedGetResponse)
    );
    expect(redisGetMock).to.have.been.calledOnce;
    expect(loadFilesMock).to.have.been.calledOnce;
  });

  it("List files from empty path test", async () => {
    const dir = "/Users/default/Projects/empty";

    redisGetMock = sinon.stub(redis, "getAsync").returns(() => null);
    loadFilesMock.resolves(null);

    const result = await ListFilesMockedDependency(redis)(dir);

    expect(result).to.be.null;
    expect(redisGetMock).to.have.been.calledOnce;
    expect(loadFilesMock).to.have.been.calledOnce;
  });
});
