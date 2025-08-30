import { promises as fs } from 'fs';
import path from 'path';

const CACHE_FILE = path.resolve(process.cwd(), './yesterday.json');

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTimeHHMM(str) {
  // 输入: "2025-08-30T15:51+08:00" 或 "2025-08-30 15:51"
  if (!str) return '';
  const m = str.match(/T?(\d{2}:\d{2})/);
  return m ? m[1] : str;
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${d.getDate()}日${weekdays[d.getDay()]}`;
}

function formatTempLabel(temp, isHigh) {
  if (!temp && temp !== 0) return '';
  return (isHigh ? '高温 ' : '低温 ') + temp + '℃';
}

function parseDateKey(dateKey) {
  const [y, m, d] = (dateKey || '').split('-').map(Number);
  return Number.isFinite(y) ? new Date(y, (m || 1) - 1, d || 1) : null;
}

function addDays(dateKey, delta) {
  const d = parseDateKey(dateKey) || new Date();
  d.setDate(d.getDate() + delta);
  return formatDate(d);
}

async function loadCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    const obj = JSON.parse(raw);
    return (obj && typeof obj === 'object') ? obj : {};
  } catch (e) {
    return {};
  }
}

async function saveCache(cacheObj) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cacheObj, null, 2), 'utf8');
}

function pickTodayDaily(src) {
  // 优先使用 src.today（如果包含日期等），否则回退到 src.daily[0]
  const maybe = src?.today && (src.today.date || src.today.fxDate || src.today.tempMax) ? src.today : (src?.daily?.[0] || null);
  return maybe ? { ...maybe } : null;
}

function mapDailyToYesterdayShape(daily) {
  if (!daily) return {
    date_1: '',
    high_1: '',
    low_1: '',
    day_1: { type_1: '', fx_1: '', fl_1: '' },
    night_1: { type_1: '', fx_1: '', fl_1: '' }
  };
  return {
    date_1: daily.fxDate || daily.date || '',
    high_1: daily.tempMax || daily.temp_max || '',
    low_1: daily.tempMin || daily.temp_min || '',
    day_1: {
      type_1: daily.textDay || daily.text_day || '',
      fx_1: daily.windDirDay || daily.wind_dir_day || '',
      fl_1: daily.windScaleDay || daily.wind_scale_day || ''
    },
    night_1: {
      type_1: daily.textNight || daily.text_night || '',
      fx_1: daily.windDirNight || daily.wind_dir_night || '',
      fl_1: daily.windScaleNight || daily.wind_scale_night || ''
    }
  };
}

/**
 * 适配器：把上层 getWeather() 的结构映射为下层 Weather 结构，并处理两天缓存逻辑
 * @param {Object} src getWeather() 返回的对象（保留了 now / today / daily 等字段）
 * @returns {Promise<Object>} 下层 Weather 结构 JSON
 */
export async function adaptWeather(src) {
  const cache = await loadCache(); // { "<Date>": { ...daily... }, "<Date>": { ... } }
  const todayDaily = pickTodayDaily(src);
  // 确定用于 key 的 todayKey（优先使用 daily 中的日期字段，否则用系统本地日期）
  const todayKey = (todayDaily && (todayDaily.fxDate || todayDaily.date)) || formatDate(new Date());
  const yesterdayKey = addDays(todayKey, -1);

  // 决定要返回的 yesterday 数据：
  let yesterdayDaily = null;

  // 优先：如果缓存中存在 yesterdayKey，直接用它；
  if (cache[yesterdayKey]) {
    yesterdayDaily = cache[yesterdayKey];

  } else if (cache[todayKey]) {
    // 其次：如果缓存里存在 todayKey（说明缓存已包含今天），则返回紧邻今天的前一条缓存（即较旧的那条）；
    const keys = Object.keys(cache).sort();
    const idx = keys.indexOf(todayKey);
    if (idx > 0) yesterdayDaily = cache[keys[idx - 1]];

  } else {
    // 否则：尝试返回缓存中最新但小于 todayKey 的那一条（如果有的话）
    const keys = Object.keys(cache).sort();
    const prevKeys = keys.filter(k => k < todayKey);
    if (prevKeys.length) {
      yesterdayDaily = cache[prevKeys[prevKeys.length - 1]];
    }
  }

  // 更新缓存：将今天的 daily（如果存在）写入缓存，然后只保留最近两天
  if (todayDaily) {
    cache[todayKey] = todayDaily;
  }
  // 保留最近两条（按 key 升序，slice(-2) 取最后两天）
  const sortedKeys = Object.keys(cache).sort();
  const keepKeys = sortedKeys.slice(-2);
  const newCache = {};
  for (const k of keepKeys) newCache[k] = cache[k];
  await saveCache(newCache);

  // 构建下层 Weather 结构，字段完全对应下层
  const result = {
    ok: true,
    data: {
      city: src.city || '',
      updatetime: formatTimeHHMM(src.updateTime || src.now?.obsTime || ''),
      wendu: src.now?.temp || '',
      fengli: src.now?.windScale || src.now?.windSpeed || '',
      shidu: src.now?.humidity || '',
      fengxiang: src.now?.windDir || '',
      sunrise_1: todayDaily?.sunrise || (src.daily?.[0]?.sunrise) || '',
      sunset_1: todayDaily?.sunset || (src.daily?.[0]?.sunset) || '',
      sunrise_2: {},
      sunset_2: {},
      yesterday: mapDailyToYesterdayShape(yesterdayDaily),
      forecast: {
        weather: (src.daily || []).map(d => ({
          date: formatDateLabel(d.fxDate || d.date || ''),
          high: formatTempLabel(d.tempMax || d.temp_max || '', true),
          low: formatTempLabel(d.tempMin || d.temp_min || '', false),
          day: {
            type: d.textDay || d.text_day || '',
            fengxiang: d.windDirDay || d.wind_dir_day || '',
            fengli: d.windScaleDay || d.wind_scale_day || ''
          },
          night: {
            type: d.textNight || d.text_night || '',
            fengxiang: d.windDirNight || d.wind_dir_night || '',
            fengli: d.windScaleNight || d.wind_scale_night || ''
          }
        }))
      },
      zhishus: { zhishu: [] }
    }
  };


  return result;
}

// 如果直接运行此文件做演示
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const { getWeather } = await import('./weather.js');
      const src = await getWeather();
      const adapted = await adaptWeather(src);
      console.log(JSON.stringify(adapted, null, 2));
    } catch (err) {
      console.error(err);
    }
  })();
}
