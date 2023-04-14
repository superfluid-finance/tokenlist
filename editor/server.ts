import http from "http";
import fs from "fs";
import path from "path";

const PORT = 3000;

fs.readFile(path.resolve(__dirname, "./index.html"), (err, html) => {
  if (err) throw err;

  http
    .createServer(async (req, res) => {
      if (req.url === "/node_modules/vanilla-jsoneditor/index.js") {
        // Set the response headers for the JavaScript module
        res.writeHead(200, { "Content-Type": "application/javascript" });

        // Read the JavaScript module from disk and send it to the client
        fs.readFile("node_modules/vanilla-jsoneditor/index.js", (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("Error loading JavaScript module");
          } else {
            res.end(data);
          }
        });
      } else {
        const packageJson = await import("../package.json");
        const currentTokenList = await import(
          `../versions/token-list_v${packageJson.version}.json`
        );

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(
          html.toString().replace("$JSON", JSON.stringify(currentTokenList))
        );
        res.end();
      }
    })
    .listen(PORT, () => console.log(`JSON Editor listening on port ${PORT}`));
});
