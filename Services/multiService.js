import { getSubscribers, sendMessage } from "./pushService.js";
import { getGoOffCnt } from "./workService.js";

export async function findAndSend(goOff) {
  try {
    //구독자 목록
    const subscribers = await getSubscribers();
    if (subscribers === null) throw new Error("subscriber is null");
    console.log(`subscribers:${subscribers.length}`);

    //구독자중 금일 직출/직퇴가 있는 사람 목록
    const list = await getGoOffCnt(subscribers.join(","), goOff);
    if (list === null) throw new Error("list is null");
    console.log(`list:${list.length}`);

    //직출 직퇴 있는 구독자에게 메시지 전송
    subscribers.forEach((subscriber) => {
      list.forEach((work) => {
        if (subscriber == work.empNo) {
          if (goOff === "go") {
            if (!work.drtGoDtStr) {
              console.log(`sendMessage: ${subscriber}: ${work}`);
              sendMessage(
                subscriber,
                "직출 등록 안내",
                `${work.empNm}님의 ${work.cmtTypeNm}건 출근 등록이 필요합니다.\n고객사명: ${work.cstmsNm}\n위치: ${work.place}`
              );
            }
          }
          else if (goOff === "off") {
            if (!work.drtOffDtStr) {
              console.log(`sendMessage: ${subscriber}: ${work}`);
              sendMessage(
                subscriber,
                "직퇴 등록 안내",
                `${work.empNm}님의 ${work.cmtTypeNm}건 퇴근 등록 안내드립니다.\n고객사명: ${work.cstmsNm}\n위치: ${work.place}`
              );
            }
          }
        }
      });
    });

  } catch (error) {
    console.log(error);
    throw error;
  }
}