import express from "express";
const app = express();
const port = 3456;

// TODO: 目前返回固定数据
const mockWeather = {
  ok: true,
  data: {
    city: "朝阳区 (测试数据)",
    updatetime: "21:30",
    wendu: "22",
    fengli: "1级",
    shidu: "80%",
    fengxiang: "西风",
    sunrise_1: "04:54",
    sunset_1: "18:26",
    sunrise_2: {},
    sunset_2: {},
    yesterday: {
      date_1: "25日星期一",
      high_1: "高温 26℃",
      low_1: "低温 19℃",
      day_1: {
        type_1: "多云",
        fx_1: "东风",
        fl_1: "3-4级",
      },
      night_1: {
        type_1: "阴",
        fx_1: "南风",
        fl_1: "2-3级",
      },
    },
    forecast: {
      weather: [
        {
          date: "26日星期二",
          high: "高温 26℃",
          low: "低温 18℃",
          day: {
            type: "多云",
            fengxiang: "东北风",
            fengli: "1-2级",
          },
          night: {
            type: "多云",
            fengxiang: "南风",
            fengli: "1级",
          },
        },
      ],
    },
    zhishus: {
      zhishu: [
        {
          name: "紫外线强度",
          value: "极低",
          detail: "",
        },
        {
          name: "感冒指数",
          value: "易发",
          detail: "注意增减衣物",
        },
      ],
    },
  },
};

app.get("/weather", (req, res) => {
  res.json(mockWeather);
});

app.listen(port, () => {
  console.log(`Weather API mock server running at http://localhost:${port}/weather`);
});
