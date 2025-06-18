import express from "express";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { notify, subscribe, getSubscribers, sendMessage } from "../Services/pushService.js";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { getGoOffCnt } from "../Services/workService.js";
import { findAndSend } from "../Services/multiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pushRouter = express.Router();


//구독 (중복 시 삭제)
pushRouter.post("/subscribe", subscribe);

//강제 알림
pushRouter.get("/notify/:key", notify);


pushRouter.get("/test/:goOff", async (req, res) => {
  try {
    // var cnt = 0;
    var goOff = req.params.goOff;

    // //구독자 목록
    // const subscribers = await getSubscribers();
    // if (subscribers === null) throw new Error("subscriber is null");
    // console.log(`subscribers:${subscribers.length}`)

    // //구독자중 금일 직출/직퇴가 있는 사람 목록
    // const list = await getGoOffCnt(subscribers.join(","), goOff);
    // if (list === null) throw new Error("list is null");
    // console.log(`list:${list.length}`);

    // subscribers.forEach(subscriber => {
    //   list.forEach(work => {
    //     if (subscriber == work.empNo) {
    //       if (goOff === "go") {
    //         sendMessage(subscriber, "직출 안내", `${work.empNo}: ${work.drtGoDtStr}`);
    //       }
    //       else if (goOff === "off") {
    //         sendMessage(subscriber, "직퇴 안내", `${work.empNo}: ${ work.drtOffDtStr }`);
    //       }
    //       else{}
    //     }
    //   });
    // });
    findAndSend(goOff);

    res.status(200).send("cnt");
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch data");
  }
});

export default pushRouter;
