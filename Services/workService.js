// controllers/workController.js
import express from "express";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import FormData from "form-data";
import { getToday } from "../utils/helper.js";

const serverUrl = "https://tbms.mobileleader.com:8010";
const loginPath = "/outsidework/mobile/login";
const testPath = "/attendance/outsidework/list";

const myId = "jwkim@inzisoft.com";

// 쿠키 저장 jar 생성 및 axios wrapper
const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

export async function login(req, res) {
  try {
    const requestForm = new FormData();
    requestForm.append("userId", myId);
    requestForm.append("userPw", process.env.TBMS_PW);

    const response = await client.post(serverUrl + loginPath, requestForm);
    console.log(response.status + "\n" + response.data);

    // 1. HTTP status code 체크
    if (response.status !== 200) {
      throw new Error(`Login failed, status code: ${response.status}`);
    }

    // 2. data 존재 여부 체크
    if (!response.data) {
      throw new Error("Login failed, response has no data");
    }

    /* 응답 html인 경우 */
    if (response.headers["content-type"]?.startsWith("text/html")) {
      throw new Error("Unexpected HTML response (maybe server error)");
    }

    if (response?.data?.result === "fail") {
      throw new Error(response?.data?.errMsg || "Login failed");
    }

    console.log("login complete");
    return true;
  } catch (err) {
    console.error("Login error:", err.message);
    return false;
  }
};

export async function fetchData(req, res) {
  try {
    const empNo = "";
    const today = getToday();

    const requestForm = new FormData();
    requestForm.append("empNo", empNo);
    requestForm.append("empNoList", empNo);
    requestForm.append("strtDd", today);
    requestForm.append("endDd", today);

    const response = await client.post(serverUrl + testPath, requestForm);

    res.status(200).send(response.data);
  } catch (err) {
    console.error("Data fetch error:", err.message);
    res.status(500).send("Failed to fetch data");
  }
};

export async function getGoOffCnt(empNoList, goOff, retry = 0) {
  try {
    const today = getToday();
    const requestForm = new FormData();

    // requestForm.append("empNo", empNo);
    requestForm.append("empNoList", empNoList);
    requestForm.append("strtDd", today);
    requestForm.append("endDd", today);

    if (goOff === "go") {
      requestForm.append("cmtTypeCdList", "DRT_GO");
      requestForm.append("cmtTypeCdList", "DRT_GO_OFF");
      requestForm.append("cmtTypeCdList", "BIZ_TRIP");
    } else if (goOff === "off") {
      requestForm.append("cmtTypeCdList", "DRT_OFF");
      requestForm.append("cmtTypeCdList", "DRT_GO_OFF");
      requestForm.append("cmtTypeCdList", "BIZ_TRIP");
    }

    const response = await client.post(serverUrl + testPath, requestForm);

    if (response.headers["content-type"]?.startsWith("text/html")) {
      if (retry >= 4) {
        // 안전장치: 4번만 재로그인 후 재시도
        console.error("Retry failed, still got HTML response" + retry);
        return null;
      }
      console.warn("Session expired, logging in again...");
      const loggedIn = await login();
      if (!loggedIn) return null;
      return await getGoOffCnt(empNoList, goOff, retry + 1);
    }

    return response.data?.list ?? null;
  } catch (err) {
    console.error("Data fetch error:", err.message);
    return null;
  }
};