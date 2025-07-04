const jsonServer = require("json-server");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const server = jsonServer.create();
// Use database file inside the db directory
const router = jsonServer.router(path.join(__dirname, "db", "db.json"));
const middlewares = jsonServer.defaults();

const port = 3001;
const uploadDir = path.join(__dirname, "public/uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

server.use(cors());
server.use(middlewares);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Custom endpoint to handle file uploads
server.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Respond with the URL to the uploaded file
  res.json({
    message: "File uploaded successfully",
    url: `http://localhost:${port}/uploads/${req.file.filename}`,
  });
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

// Use the default router
server.use(router);

server.listen(port, () => {
  console.log(
    `JSON Server with file upload is running on http://localhost:${port}`
  );
});
