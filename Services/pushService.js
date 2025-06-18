import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// lowdb 세팅
const file = path.join(__dirname, "../db.json");
const adapter = new JSONFile(file);
const defaultData = { subscriptions: {} };

// 초기 데이터(defaultData) 넘기기
const db = new Low(adapter, defaultData);
await db.read();
// db.data가 비어있으면 초기화
db.data ||= defaultData;
await db.write();

webpush.setVapidDetails(
  "mailto:example@example.com",
  "BFSA_8aQ8Ib7U4MSsWiMHrlXB5cfa8h2QBhSC_70yzydT3w6WGLQyzy1PmPg9LERgqwhkdYE-wwPaRkFWGI8eng",
  "igqtORuSgacSjVtYX-5ClCyxkTVXGO3d3yoED3xR4sk"
);

//구독 (중복 시 삭제)
// pushRouter.post("/subscribe", async (req, res) => {
export async function subscribe(req, res) {
  const { key, subscription } = req.body;
  const { endpoint, keys } = subscription;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: "Invalid subscription data" });
  }

  await db.read();
  db.data ||= { subscriptions: {} };

  // 중복 검사 및 삭제
  for (const [existingKey, existingSub] of Object.entries(db.data.subscriptions)) {
    if (
      existingSub.endpoint === endpoint &&
      existingSub.keys?.p256dh === keys.p256dh &&
      existingSub.keys?.auth === keys.auth
    ) {
      delete db.data.subscriptions[existingKey];
      console.log(`Duplicate subscription removed: ${existingKey}`);
    }
  }

  // 새 구독 저장
  db.data.subscriptions[key] = subscription;
  await db.write();

  res.status(201).json({ message: "Subscribed successfully" });
};

//강제 알림
export async function notify(req, res) {
  const key = req.params.key;
  await db.read();
  const subscription = db.data.subscriptions[key];

  if (!subscription) return res.status(404).send("No subscription found");

  const payload = JSON.stringify({ title: "알림", body: `푸시 메시지 for ${key}` });

  try {
    await webpush.sendNotification(subscription, payload);
    res.send("Push sent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Push failed");
  }
};

export async function getSubscribers() {
  await db.read();
  const allKeys = Object.keys(db.data.subscriptions);
  
  return allKeys;
}

export async function sendMessage(key, title, message) {
  await db.read();
  const subscription = db.data.subscriptions[key];

  if (!subscription) throw new Error("No subscription found");//return res.status(404).send("No subscription found");

  const payload = JSON.stringify({ title: title, body: message });

  try {
    await webpush.sendNotification(subscription, payload);
    // res.send("Push sent");
    return;
  } catch (err) {
    console.error(err);
    // res.status(500).send("Push failed");
    throw new Error("Push failed");
  }
};







// // import { db } from "../db.js";
// import webpush from "web-push";

// // VAPID 설정
// webpush.setVapidDetails(
//   "mailto:example@example.com",
//   "BFSA_8aQ8Ib7U4MSsWiMHrlXB5cfa8h2QBhSC_70yzydT3w6WGLQyzy1PmPg9LERgqwhkdYE-wwPaRkFWGI8eng",
//   "igqtORuSgacSjVtYX-5ClCyxkTVXGO3d3yoED3xR4sk"
// );

// export async function subscribeUser(key, subscription) {
//   const { endpoint, keys } = subscription;
//   if (!endpoint || !keys?.p256dh || !keys?.auth) {
//     throw new Error("Invalid subscription data");
//   }

//   await db.read();
//   db.data ||= { subscriptions: {} };

//   // 중복 제거
//   for (const [existingKey, existingSub] of Object.entries(db.data.subscriptions)) {
//     if (
//       existingSub.endpoint === endpoint &&
//       existingSub.keys?.p256dh === keys.p256dh &&
//       existingSub.keys?.auth === keys.auth
//     ) {
//       delete db.data.subscriptions[existingKey];
//       console.log(`Duplicate subscription removed: ${existingKey}`);
//     }
//   }

//   // 저장
//   db.data.subscriptions[key] = subscription;
//   await db.write();
// }

// export async function notifyUser(key) {
//   await db.read();
//   const subscription = db.data.subscriptions[key];

//   if (!subscription) throw new Error("No subscription found");

//   const payload = JSON.stringify({ title: "알림", body: `푸시 메시지 for ${key}` });
//   await webpush.sendNotification(subscription, payload);
// }
