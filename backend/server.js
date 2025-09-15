import { open, readdir, rename, rm, stat, unlink } from "fs/promises";
import http from "http";
import fs, { createWriteStream, WriteStream } from "fs";
import mime from "mime-types";
const ROOT_DIR = "./storage";
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  console.log("client connected");
  let queryParams = {};
  const userPath = decodeURIComponent(req.url);
  const [url, query] = userPath?.split("?");
  query?.split("&").forEach((item) => {
    const [key, value] = item.split("=");
    queryParams[key] = value;
  });
  if (req.method === "GET") {
    if (url === "/favicon.ico") return res.end("not found");
    if (url === "/") {
      const data = await retreiveDir(ROOT_DIR, url);
      res.setHeader("Content-type", "application/json");
      res.end(JSON.stringify(data));
    } else {
      let fd;
      try {
        const fullPath = ROOT_DIR + url;
        fd = await open(fullPath, "r+");
        const stats = await fd.stat();
        if (stats.isDirectory()) {
          const data = await retreiveDir(fullPath, url);
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(data));
        } else {
          res.setHeader("content-type", mime.lookup(fullPath));
          res.setHeader("content-length", stats.size);
          if (queryParams.action === "download") {
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${url.split("/").at(-1)}"`
            );
          }
          const stream = fs.createReadStream(null, {
            fd: fd.fd,
            autoClose: false,
          });
          stream.on("data", (chunk) => {
            res.write(chunk);
          });
          stream.on("end", async () => {
            res.end();
            await fd.close();
          });
        }
      } catch (err) {
        console.log(err);
        res.end("not found");
      }
    }
  } else if (req.method === "POST") {
    const writeStream = createWriteStream(`./storage/${req.headers.filename}`);
    req.pipe(writeStream);
    req.on("end", () => res.end("uploaded"));
  } else if (req.method === "OPTIONS") {
    res.end("Ok");
  } else if (req.method === "DELETE") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      body = JSON.parse(body);
      try {
        if (body.type === "folder") {
          await rm("./storage" + body.path, { recursive: true, force: true });
        } else {
          await unlink("./storage" + body.path);
        }
        res.end("Deleted successfully");
      } catch (err) {
        res.end("invalid file path");
      }
    });
  } else if (req.method === "PATCH") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      body = JSON.parse(body);
      try {
        await rename("./storage" + body.path, "./storage" + body.newName);
        res.end("Renamed successfully");
      } catch (err) {
        console.log(err);
        res.end("invalid file path");
      }
    });
  }
});

server.listen(3000, "0.0.0.0", () => {
  console.log("server is listening on port 3000");
});

async function retreiveDir(name, url) {
  let folderData = [];
  const data = await readdir(name);
  for (const item of data) {
    const stats = await stat(name + "/" + item);
    folderData.push({
      name: item,
      type: stats.isDirectory() ? "folder" : "file",
      path: (url === "/" ? "" : url) + "/" + item,
    });
  }
  return folderData;
}
