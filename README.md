# 香港 12/5–12/7 聖誕限定美食伴手禮行程

一個純靜態（HTML / CSS / JavaScript）的單頁行程網站，整理 2026 年 12/5–12/7 香港聖誕限定三日行程：
**15 間港式美食**、**10 個伴手禮品牌**（含 3 個爆紅目標）、**42 項聖誕活動**，並附上 Leaflet 互動地圖（座標標記＋依日期／分類上色＋圖例切換）。

## 目錄結構

```
hk-christmas-food/
├── index.html                  # 主頁面（唯一入口）
├── README.md                   # 本說明檔
├── .nojekyll                   # 讓 GitHub Pages 直接服務底線開頭的檔案
└── assets/
    ├── css/
    │   └── styles.css          # 全站樣式（含 RWD 與 a11y）
    ├── js/
    │   ├── data.js             # 行程資料（活動／美食／伴手禮／移動節點＋座標）
    │   └── app.js              # 分頁切換與 Leaflet 地圖邏輯
    └── vendor/
        ├── leaflet.js          # Leaflet 1.9.4（已本地化，離線可用）
        └── leaflet.css
```

> 所有資源皆為相對路徑，整個資料夾可直接部署，不需任何建置步驟。

## 本機預覽

因為地圖圖磚需要網路，建議用本機伺服器開啟（直接雙擊 `index.html` 也能看，但部分瀏覽器會限制本機檔案讀取）：

```bash
# 在專案資料夾內
python3 -m http.server 8000
# 然後開啟 http://localhost:8000
```

## 部署到 GitHub Pages

### 方法 A：上傳到既有 repo（最簡單）

1. 在 GitHub 建立或開啟你的 repo（例如 `1205-07HK`）。
2. 把本資料夾**內的所有檔案**上傳到 repo 根目錄（`index.html` 要在最上層）。
3. 進入 repo → **Settings → Pages**。
4. **Source** 選 `Deploy from a branch`，Branch 選 `main`、資料夾選 `/ (root)`，按 **Save**。
5. 等 1–2 分鐘，網址會是：
   `https://<你的帳號>.github.io/<repo 名稱>/`

### 方法 B：用命令列推送

```bash
cd hk-christmas-food
git init
git add .
git commit -m "香港 12/5–12/7 聖誕限定美食伴手禮行程"
git branch -M main
git remote add origin https://github.com/<你的帳號>/<repo 名稱>.git
git push -u origin main
```

推送後同樣到 **Settings → Pages** 開啟（Branch `main` / `/ (root)`）。

### 方法 C：放到子資料夾

若 repo 內已有其他內容，可把本資料夾改名為 `hk-christmas-food/` 放進 repo，網址即為
`https://<你的帳號>.github.io/<repo 名稱>/hk-christmas-food/`。

## 更新行程內容

所有行程資料集中在 **`assets/js/data.js`**，分成四個陣列，改這裡即可，不用動 HTML：

| 陣列 | 內容 | 筆數 |
|------|------|------|
| `EVENTS` | 聖誕活動（含 `day` 分類：`d1`/`d2`/`d3`/`dead`） | 42 |
| `MOVES` | 住宿、機場、地鐵／碼頭移動節點 | 10 |
| `FOOD` | 港式美食（`d1`/`d2`/`d3` 為順路主線，`food` 為備選） | 15 |
| `GIFTS` | 伴手禮品牌（`d1`/`d2`/`d3`） | 10 |

每筆資料欄位：

```js
{ n:"名稱", v:"地點／地址", a:"交通提示", d:"營業時間／日期",
  day:"d1", lat:22.2819, lng:114.1600, plan:"當天安排說明" }
```

- `day` 決定標記顏色：`d1` 紅（12/5）、`d2` 藍（12/6）、`d3` 綠（12/7）、
  `hotel` 紫、`airport` 藍灰、`move` 橘、`food` 棕、`gift` 桃紅、`dead` 灰。
- 顏色定義在 `data.js` 的 `DAY_COLORS`，可自由調整。
- 三日動線（虛線）定義在 `app.js` 的 `ROUTES`，座標為 `[lat, lng]` 陣列。

## 技術說明

- **無框架、無建置**：純 HTML/CSS/JS，載入即用。
- **地圖**：Leaflet 1.9.4（本地化於 `assets/vendor/`），圖磚使用 CARTO Voyager（需網路）。
- **響應式**：手機、平板、桌機皆自適應；地圖高度與時間軸在窄螢幕自動調整。
- **無障礙**：skip link、ARIA 角色（tablist／tabpanel／application）、鍵盤可操作的分頁與圖例、`prefers-reduced-motion` 支援。
- **資料來源**：以 Facebook／Instagram／Threads 搜尋 2026 年 12/5–7 香港聖誕活動，並以旅發局、商場官方及本地媒體交叉核對日期。

## 注意事項

- 店名、地址、營業時間與公休日以頁面標註為準；標示「營業時間未核實」者，出發前請再確認。
- 價格僅供參考，各店調價頻繁。
- 航班時刻為表定時間，實際起降以航空公司當日公告為準。
- 本頁為個人行程整理，非商業推薦。
