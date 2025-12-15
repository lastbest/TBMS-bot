// scheduler.js
import cron from "node-cron";
import { findAndSend } from "./Services/multiService.js";
import { login } from "./Services/workService.js";

// 09:30
cron.schedule("30 9 * * *", async () => {
  console.log("스케줄러 실행:", new Date().toLocaleString());
  await login();
  findAndSend("go");
});

// 09:55
cron.schedule("55 9 * * *", async () => {
  console.log("스케줄러 실행:", new Date().toLocaleString());
  await login();
  findAndSend("go");
});

//출장 12:00
cron.schedule("0 12 * * *", async() => {
  console.log("스케줄러 실행:", new Date().toLocaleString());
  await login();
  findAndSend("trip");
});

//퇴근 17:00
cron.schedule("0 17 * * *", async() => {
  console.log("스케줄러 실행:", new Date().toLocaleString());
  await login();
  findAndSend("off");
});

//퇴근 18:00
cron.schedule("0 18 * * *", async() => {
  console.log("스케줄러 실행:", new Date().toLocaleString());
  await login();
  findAndSend("off");
});

// cron.schedule("20 22 17 * * *", async () => {
//   console.log("테스트 스케줄러 실행:", new Date().toLocaleString());
//   await login();
//   findAndSend("off");
// });