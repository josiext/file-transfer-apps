import Fastify from "fastify";
import { open, writeFile, mkdir } from "node:fs/promises";
import Multipart from "@fastify/multipart";
import path from "path";
import mime from "mime-types";
import cors from "@fastify/cors";

const APP_PORT = 3100;

const FILE_TO_DOWNLOAD = "./example.webp";
const DIR_TO_UPLOAD = "./uploads";

try {
  await mkdir(DIR_TO_UPLOAD);
} catch (err) {
  if (err.code !== "EEXIST") {
    console.error(err);
    process.exit(1);
  }
}

const fastify = Fastify({ bodyLimit: 10 * 1024 * 1024 });

await fastify.register(cors, {
  origin: "*",
  exposedHeaders: "*",
});

fastify.addContentTypeParser(
  "application/octet-stream",
  { parseAs: "buffer" },
  function (_, payload, done) {
    done(null, payload);
  }
);

fastify.register(Multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

fastify.get("/", async function handler() {
  return { file: "transfer app" };
});

fastify.get("/download", async function handler(_, reply) {
  const fd = await open(FILE_TO_DOWNLOAD);
  const stream = fd.createReadStream();

  const mimeType = mime.lookup(FILE_TO_DOWNLOAD);

  console.log(`Downloading -> ${FILE_TO_DOWNLOAD}`);

  return reply
    .type(mimeType)
    .header(
      "Content-Disposition",
      `attachment; filename=${path.basename(FILE_TO_DOWNLOAD)}`
    )
    .send(stream);
});

fastify.post("/upload", async function handler(request) {
  const data = await request.file();
  const fileBuffer = await data.toBuffer();
  const filename = data.filename;

  const filePath = path.join(DIR_TO_UPLOAD, filename);

  await writeFile(filePath, fileBuffer);

  console.log(`Uploaded -> ${filePath}`);

  return { uploaded: true };
});

fastify.post("/upload-multiples", async function handler(request) {
  const parts = request.files();
  const uploadResults = [];

  for await (const file of parts) {
    const fileBuffer = await file.toBuffer();
    const filename = file.filename;
    const filePath = path.join(DIR_TO_UPLOAD, filename);

    await writeFile(filePath, fileBuffer);
    uploadResults.push({ filename, uploaded: true });
    console.log(`Uploaded -> ${filePath}`);
  }

  return { uploadedFiles: uploadResults };
});

fastify.post("/upload-octet-stream", async function handler(request) {
  const filename = request.headers["x-file-name"] ?? "unknown.text";

  const data = request.body;
  const filePath = path.join(DIR_TO_UPLOAD, filename);

  await writeFile(filePath, data);

  return { uploaded: true };
});

try {
  await fastify.listen({ port: APP_PORT });
  console.log(`Server listening on ${fastify.server.address().port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
