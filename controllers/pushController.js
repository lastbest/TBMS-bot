import express from "express";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { notify, subscribe, getSubscribers, sendMessage } from "../Services/pushService.js";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { getGoOffCnt, login } from "../Services/workService.js";
import { findAndSend, keyTrimTest } from "../Services/multiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pushRouter = express.Router();


//구독 (중복 시 삭제)
pushRouter.post("/subscribe", subscribe);

//강제 알림
pushRouter.get("/notify/:key", notify);


pushRouter.get("/test/:goOff", async (req, res) => {
  try {
    var goOff = req.params.goOff;
    // findAndSend(goOff);
    await login();
    keyTrimTest(goOff);

    res.status(200).send("test");
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch data");
  }
});

export default pushRouter;
