# Code Challenge

Develop a Node.Js api that allows a client app to obtain the full directory listing of a given directory path on the local filesystem. Include the full path, file size and attribute information in the result and cater for a large directory size ( at least 100 000). Make sure the application is containerized and can run on any system. You can use REST or Graphql. We are a Graphql company, but if you don’t know it yet then I would suggest you use what you know best.

## Implementation

A REST Api was implemented to obtain a list of files inside a directory. In case the listing is too big a pagination logic was developed using Redis to cache the response, and a maximum files per page was set to 100. The response is cached for 1 hour, and after that the application goes to the local filesystem to obtain the listing.

Some tests were done in my machine(Intel Dual Core i5 1.6 GHz, 8GB RAM), the API took 4 seconds to load aprox 150K files.

After dockerization some performance was lost. This is a known issue of Docker for Mac/Windows regarding file system access. This could be resolved by running the application on a Linux VM.

### Architecture

I followed the Clean Architecture concepts. The idea is to isolate the application from external tools(infrastructure) as much as possible, leaving the core(business logic) unaware and not dependable of technology/vendor.

### How to run application

Docker container as used as per requirement. Configuration can be found at `Dockerfile` and `docker-compose.yml`.

Inside `docker-composer.yml` you can find the following configuration:

```yml
volumes:
  - /Users:/Users:cached
```

This means I bind-mounted everything inside the folder /Users from my machine to be accessible from my container. Make sure this configuration suits your OS.

To build and run the application, go to the app root folder and run:

```
    docker-compose up --build
```

Check if both `redis-server` and `nodejs` containers are up and running:

```
    docker ps -a
```

To shutdown and destroy containers:

```
    docker-compose down
```

### Testing

Unit tests were implemented covering the main use cases. Frameworks used: mocha, chai, sinon.

To run tests:

```
    yarn test
```

### Request

Query params:

- fromPath : Local filesystem path
- filesPerPage : Number of files per page. Default is 100
- page : Current page number to be show, in case pagination is necessary

```
    curl http://127.0.0.1:3000/files?fromPath=/Users/jhessica/Projects
```

### Response

```
{
    "path": "/Users/jhessica/Projects",
    "page": 3,
    "totalPages": 23,
    "totalElements": 2342,
    "filesPerPage": 100,
    "files": [
        {
            "name": "_limitProperties.txt",
            "fullPath": "/Users/jhessica/Projects/_limitProperties.txt",
            "size": 376,
            "extension": ".txt"
        },
        {
            "name": "allOf.jpeg",
            "fullPath": "/Users/jhessica/Projects/allOf.jpeg",
            "size": 609,
            "extension": ".jpeg"
        },

        ...

    ]
```
