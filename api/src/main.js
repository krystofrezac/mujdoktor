import express from "express";
import cors from "cors";
import { setupRouter } from "./router.js";

const PORT = 4000;

const app = express();
app.use(express.json());
app.use(cors());

setupRouter(app);

app.listen(PORT);
console.log(`app listening on localhost:${PORT}`);
