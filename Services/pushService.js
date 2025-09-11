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

/**
 * 구독 등록
 * - 같은 endpoint/p256dh/auth 조합이 이미 있으면 중복 제거 후 다시 등록
 */
export async function subscribe(req, res) {
  const { subscription, empNo } = req.body;
  const { endpoint, keys } = subscription;

  if (!endpoint || !keys?.p256dh || !keys?.auth || !empNo) {
    return res.status(400).json({ message: "Invalid subscription data" });
  }

  await db.read();
  db.data ||= { subscriptions: {} };

  // 해당 사번이 없으면 배열 초기화
  if (!db.data.subscriptions[empNo]) {
    db.data.subscriptions[empNo] = [];
  }

  // 기존 배열에서 중복 제거
  db.data.subscriptions[empNo] = db.data.subscriptions[empNo].filter(
    (sub) =>
      !(
        sub.endpoint === endpoint &&
        sub.keys?.p256dh === keys.p256dh &&
        sub.keys?.auth === keys.auth
      )
  );

  // 새 구독 추가
  db.data.subscriptions[empNo].push(subscription);

  await db.write();

  res.status(201).json({ message: "Subscribed successfully" });
}

/**
 * 강제 알림 (사번 + 배열의 첫 번째 구독에만 테스트 발송)
 */
export async function notify(req, res) {
  const empNo = req.params.key;
  await db.read();
  const subscriptions = db.data.subscriptions[empNo];

  if (!subscriptions || subscriptions.length === 0)
    return res.status(404).send("No subscription found");

  const payload = JSON.stringify({ title: "알림", body: `푸시 메시지 for ${empNo}` });

  try {
    // 한 사번에 여러 구독이 있으면 모두 발송
    await Promise.all(subscriptions.map((sub) => webpush.sendNotification(sub, payload)));
    res.send("Push sent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Push failed");
  }
}

/**
 * 전체 사번 목록 가져오기
 */
export async function getSubscribers() {
  await db.read();
  return Object.keys(db.data.subscriptions);
}

/**
 * 특정 사번의 구독 배열 가져오기
 */
export async function getSubscribersByEmpNo(empNo) {
  await db.read();
  return db.data.subscriptions[empNo] || [];
}

/**
 * 메시지 발송 (특정 사번에 등록된 모든 구독자에게)
 */
export async function sendMessage(empNo, title, message) {
  await db.read();
  const subscriptions = db.data.subscriptions[empNo];

  if (!subscriptions || subscriptions.length === 0) throw new Error("No subscription found");

  const payload = JSON.stringify({ title, body: message });

  try {
    await Promise.all(subscriptions.map((sub) => webpush.sendNotification(sub, payload)));
    return;
  } catch (err) {
    console.error(err);
    throw new Error("Push failed");
  }
}

export async function deleteAllSubscriptionsByEndpoint(req, res) {
  const { subscription } = req.body;
  const { endpoint, keys } = subscription;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: "Invalid subscription data" });
  }

  await db.read();
  const subs = db.data.subscriptions; // { empNo: [ { endpoint, keys }, ... ] }

  let deletedCount = 0;

  for (const empNo of Object.keys(subs)) {
    if (!Array.isArray(subs[empNo])) continue;

    const beforeCount = subs[empNo].length;

    subs[empNo] = subs[empNo].filter(
      (s) =>
        !(s.endpoint === endpoint && s.keys?.p256dh === keys.p256dh && s.keys?.auth === keys.auth)
    );

    const afterCount = subs[empNo].length;
    deletedCount += beforeCount - afterCount;

    // 만약 구독 배열이 비어버리면 깔끔하게 삭제 (optional)
    if (subs[empNo].length === 0) {
      delete subs[empNo];
    }
  }

  await db.write();

  if (deletedCount === 0) {
    return res.status(404).json({ message: "No subscriptions found for this endpoint+keys" });
  }

  return res.json({ message: `Deleted ${deletedCount} subscriptions` });
}