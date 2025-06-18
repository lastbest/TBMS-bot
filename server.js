// app.js
import express from "express";
// import { login, fetchData, go, off } from "./controllers/workController.js";
// import router from "./controllers/workController.js";
import workRouter from "./controllers/workController.js";
import pushRouter from "./controllers/pushController.js";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import "./scheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, "public")));

app.use("/work", workRouter);
app.use("/push", pushRouter);

// app.post("/subscribe", subscribe);
// app.get("/notify/:key", notify);

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
