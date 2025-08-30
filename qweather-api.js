import fetch from 'node-fetch';
import { generateJWT } from './jwt.js';

const API_HOST = process.env.QWEATHER_API_HOST;
const LOCATION_ID = process.env.QWEATHER_LOCATION_ID;

function authHeaders() {
  const jwt = generateJWT();
  return { 'Authorization': `Bearer ${jwt}` };
}

/**
 * 获取实时天气和未来3日预报
 * @returns {Promise<{
 *   city: string,
 *   updateTime: string,
 *   now: { temp: string, text: string },
 *   today: { tempMin: string, tempMax: string },
 *   daily: Array<{date: string, textDay: string, tempMin: string, tempMax: string}>
 * }>}
 */
export async function getWeather() {
  // 1. 实时天气
  const urlNow = `https://${API_HOST}/v7/weather/now?location=${LOCATION_ID}`;
  const resNow = await fetch(urlNow, { headers: authHeaders() });
  if (!resNow.ok) throw new Error(`实时天气请求失败: ${resNow.status}`);
  const dataNow = await resNow.json();
  if (dataNow.code !== '200') throw new Error(`实时天气API错误: ${dataNow.code}`);

  /**
   ********** dataNow 示例 **********
   * {
   *   "code": "200",
   *   "updateTime": "2025-08-30T11:26+08:00",
   *   "fxLink": "https://www.qweather.com/weather/chaoyang-101060110.html",
   *   "now": {
   *     "obsTime": "2025-08-30T11:22+08:00",
   *     "temp": "25",
   *     "feelsLike": "25",
   *     "icon": "104",
   *     "text": "阴",
   *     "wind360": "270",
   *     "windDir": "西风",
   *     "windScale": "3",
   *     "windSpeed": "15",
   *     "humidity": "74",
   *     "precip": "0.0",
   *     "pressure": "986",
   *     "vis": "15",
   *     "cloud": "100",
   *     "dew": "20"
   *   },
   *   "refer": {
   *     "sources": [
   *       "QWeather"
   *     ],
   *     "license": [
   *       "QWeather Developers License"
   *     ]
   *   }
   * }
   */

  // 2. 3日预报
  const url3d = `https://${API_HOST}/v7/weather/3d?location=${LOCATION_ID}`;
  const res3d = await fetch(url3d, { headers: authHeaders() });
  if (!res3d.ok) throw new Error(`预报请求失败: ${res3d.status}`);
  const data3d = await res3d.json();
  if (data3d.code !== '200') throw new Error(`预报API错误: ${data3d.code}`);

  /**
   ********** data3d 示例 **********
   * {
   *   "code": "200",
   *   "updateTime": "2025-08-30T11:26+08:00",
   *   "fxLink": "https://www.qweather.com/weather/chaoyang-101060110.html",
   *   "daily": [
   *     {
   *       "fxDate": "2025-08-30",
   *       "sunrise": "05:00",
   *       "sunset": "18:21",
   *       "moonrise": "12:11",
   *       "moonset": "21:06",
   *       "moonPhase": "蛾眉月",
   *       "moonPhaseIcon": "801",
   *       "tempMax": "26",
   *       "tempMin": "18",
   *       "iconDay": "101",
   *       "textDay": "多云",
   *       "iconNight": "104",
   *       "textNight": "阴",
   *       "wind360Day": "225",
   *       "windDirDay": "西南风",
   *       "windScaleDay": "1-3",
   *       "windSpeedDay": "3",
   *       "wind360Night": "135",
   *       "windDirNight": "东南风",
   *       "windScaleNight": "1-3",
   *       "windSpeedNight": "3",
   *       "humidity": "91",
   *       "precip": "0.0",
   *       "pressure": "987",
   *       "vis": "24",
   *       "cloud": "2",
   *       "uvIndex": "3"
   *     },
   *     {
   *       "fxDate": "2025-08-31",
   *       "sunrise": "05:02",
   *       "sunset": "18:19",
   *       "moonrise": "13:15",
   *       "moonset": "21:42",
   *       "moonPhase": "上弦月",
   *       "moonPhaseIcon": "802",
   *       "tempMax": "27",
   *       "tempMin": "17",
   *       "iconDay": "104",
   *       "textDay": "阴",
   *       "iconNight": "150",
   *       "textNight": "晴",
   *       "wind360Day": "180",
   *       "windDirDay": "南风",
   *       "windScaleDay": "1-3",
   *       "windSpeedDay": "3",
   *       "wind360Night": "180",
   *       "windDirNight": "南风",
   *       "windScaleNight": "1-3",
   *       "windSpeedNight": "3",
   *       "humidity": "86",
   *       "precip": "0.0",
   *       "pressure": "981",
   *       "vis": "24",
   *       "cloud": "3",
   *       "uvIndex": "1"
   *     },
   *     {
   *       "fxDate": "2025-09-01",
   *       "sunrise": "05:03",
   *       "sunset": "18:17",
   *       "moonrise": "14:15",
   *       "moonset": "22:27",
   *       "moonPhase": "盈凸月",
   *       "moonPhaseIcon": "803",
   *       "tempMax": "28",
   *       "tempMin": "17",
   *       "iconDay": "305",
   *       "textDay": "小雨",
   *       "iconNight": "151",
   *       "textNight": "多云",
   *       "wind360Day": "225",
   *       "windDirDay": "西南风",
   *       "windScaleDay": "1-3",
   *       "windSpeedDay": "3",
   *       "wind360Night": "225",
   *       "windDirNight": "西南风",
   *       "windScaleNight": "1-3",
   *       "windSpeedNight": "3",
   *       "humidity": "94",
   *       "precip": "0.4",
   *       "pressure": "983",
   *       "vis": "24",
   *       "cloud": "55",
   *       "uvIndex": "6"
   *     }
   *   ],
   *   "refer": {
   *     "sources": [
   *       "QWeather"
   *     ],
   *     "license": [
   *       "QWeather Developers License"
   *     ]
   *   }
   * }
   */

  // 3. 整合结果
  return {
    city: '朝阳区',
    updateTime: dataNow.updateTime,

    now: {
      temp: dataNow.now.temp,
      text: dataNow.now.text,
      windDir: dataNow.now.windDir,
      windScale: dataNow.now.windScale,
      windSpeed: dataNow.now.windSpeed,
      humidity: dataNow.now.humidity,
      precip: dataNow.now.precip,
      pressure: dataNow.now.pressure,
      vis: dataNow.now.vis,
      cloud: dataNow.now.cloud,
      dew: dataNow.now.dew,
      obsTime: dataNow.now.obsTime
    },

    today: {
      date: data3d.daily[0].fxDate,
      sunrise: data3d.daily[0].sunrise,
      sunset: data3d.daily[0].sunset,
      moonrise: data3d.daily[0].moonrise,
      moonset: data3d.daily[0].moonset,
      moonPhase: data3d.daily[0].moonPhase,
      tempMin: data3d.daily[0].tempMin,
      tempMax: data3d.daily[0].tempMax,
      textDay: data3d.daily[0].textDay,
      textNight: data3d.daily[0].textNight,
      windDirDay: data3d.daily[0].windDirDay,
      windScaleDay: data3d.daily[0].windScaleDay,
      windSpeedDay: data3d.daily[0].windSpeedDay,
      windDirNight: data3d.daily[0].windDirNight,
      windScaleNight: data3d.daily[0].windScaleNight,
      windSpeedNight: data3d.daily[0].windSpeedNight,
      humidity: data3d.daily[0].humidity,
      precip: data3d.daily[0].precip,
      pressure: data3d.daily[0].pressure,
      vis: data3d.daily[0].vis,
      cloud: data3d.daily[0].cloud,
      uvIndex: data3d.daily[0].uvIndex
    },

    daily: data3d.daily.map(d => ({
      date: d.fxDate,
      sunrise: d.sunrise,
      sunset: d.sunset,
      moonrise: d.moonrise,
      moonset: d.moonset,
      moonPhase: d.moonPhase,
      tempMin: d.tempMin,
      tempMax: d.tempMax,
      textDay: d.textDay,
      textNight: d.textNight,
      windDirDay: d.windDirDay,
      windScaleDay: d.windScaleDay,
      windSpeedDay: d.windSpeedDay,
      windDirNight: d.windDirNight,
      windScaleNight: d.windScaleNight,
      windSpeedNight: d.windSpeedNight,
      humidity: d.humidity,
      precip: d.precip,
      pressure: d.pressure,
      vis: d.vis,
      cloud: d.cloud,
      uvIndex: d.uvIndex
    }))
  };
}

// 如果直接执行此文件，则演示调用
if (import.meta.url === `file://${process.argv[1]}`) {
  getWeather()
    .then(info => {
      console.log(`【${info.city}】更新时间：${info.updateTime}`);
      console.log(`当前天气：${info.now.text}，温度 ${info.now.temp}°C`);
      console.log(`今日气温：${info.today.tempMin}°C ~ ${info.today.tempMax}°C`);
      console.log('未来3日预报：');
      info.daily.forEach(day => {
        console.log(`${day.date}：${day.textDay}，${day.tempMin}°C ~ ${day.tempMax}°C`);
      });
    })
    .catch(err => {
      console.error('获取天气失败:', err);
    });
}
