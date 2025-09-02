// controllers/workController.js
import express from "express";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import FormData from "form-data";
import { getToday } from "../utils/helper.js";
import { fetchData, login, getGoOffCnt } from "../Services/workService.js";

const empNoJWKIM = "IZ240404";

// 쿠키 저장 jar 생성 및 axios wrapper
const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));


const workRouter = express.Router();

workRouter.get("/login", async (req, res) => {
  try {
    if (!await login()) {
      throw new Error("login failed");
    }
    
    res.status(200).send("Login Complete");
  } catch (error) {
    console.log(error);
    res.status(500).send("Login failed");
  }
  
});

workRouter.get("/fetch-data", fetchData);

workRouter.get("/go", async (req, res) => {
  try {
    const empNo = req.query.empNo ? req.query.empNo : empNoJWKIM;
    const list = await getGoOffCnt(empNo, "go");
    if (list === null) throw new Error("error");

    const cnt = list.length;
    console.log(`직출개수: ${cnt}`);
    res.status(200).send(cnt > 0);
  } catch {
    res.status(500).send("Failed to fetch data");
  }
});

workRouter.get("/off", async (req, res) => {
  try {
    const empNo = req.query.empNo ? req.query.empNo : empNoJWKIM;
    const list = await getGoOffCnt(empNo, "off");
    if (list === null) throw new Error("error");

    const cnt = list.length;
    console.log(`직퇴개수: ${cnt}`);
    res.status(200).send(cnt > 0);
  } catch {
    res.status(500).send("Failed to fetch data");
  }
});


export default workRouter;