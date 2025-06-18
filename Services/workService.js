// controllers/workController.js
import express from "express";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import FormData from "form-data";
import { getToday } from "../utils/helper.js";

const serverUrl = "https://tbms.mobileleader.com:8010";
const loginPath = "/outsidework/mobile/login";
const testPath = "/outsidework/list";

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

    if (response?.data?.result === "fail") throw new Error(response?.data?.errMsg);

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

export async function getGoOffCnt(empNoList, goOff) {
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

    //todo: 로그인재시도 처리 필요
    if (response.headers['content-type'].startsWith('text/html')) return null;

    const list = response.data?.list;

    // if (list === null) return null;
    return list;
    //return response.data?.list?.length || 0;
  } catch (err) {
    console.error("Data fetch error:", err.message);
    return null;
  }

  
};