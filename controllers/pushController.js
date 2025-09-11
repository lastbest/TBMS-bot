import express from "express";
import { notify, subscribe, deleteAllSubscriptionsByEndpoint, } from "../Services/pushService.js";

import { getGoOffCnt, login } from "../Services/workService.js";
import { findAndSend, keyTrimTest } from "../Services/multiService.js";

const pushRouter = express.Router();

//구독 (중복 시 삭제)
pushRouter.post("/subscribe", subscribe);

//구독 (중복 시 삭제)
pushRouter.post("/unsubscribe", deleteAllSubscriptionsByEndpoint);

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
