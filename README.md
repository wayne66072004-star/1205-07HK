# 香港 12/5–12/7 聖誕限定行程｜GitHub Pages 部署包

純靜態網頁，無後端、無 API Key，可直接部署到 GitHub Pages。

## 檔案結構

```
.
├── index.html                  # 主頁面（單檔，含全部 CSS/JS）
├── vendor/
│   ├── leaflet.js              # Leaflet 1.9.4（地圖函式庫）
│   ├── leaflet.css
│   └── images/                 # Leaflet 內建圖示
│       ├── layers.png
│       ├── layers-2x.png
│       ├── marker-icon.png
│       ├── marker-icon-2x.png
│       └── marker-shadow.png
├── .nojekyll                   # 關閉 Jekyll 處理（重要）
└── .github/workflows/deploy.yml # GitHub Actions 自動部署
```

## 部署方式 A：GitHub Actions（推薦）

1. 建立 repo，把**全部檔案**（含 `.github/`、`.nojekyll`）推上 `main` 分支
2. repo → Settings → Pages → Source 選 **GitHub Actions**
3. push 後 Actions 會自動跑，約 1–2 分鐘完成

## 部署方式 B：Deploy from a branch（最簡單）

1. 建立 repo，把檔案推上 `main`
2. Settings → Pages → Source 選 **Deploy from a branch**
3. Branch 選 `main`、資料夾選 `/ (root)` → Save
4. 約 1–3 分鐘生效

## 網址

- 使用者站台（repo 名稱 = `<你的帳號>.github.io`）：`https://<你的帳號>.github.io/`
- 專案站台（其他 repo 名稱）：`https://<你的帳號>.github.io/<repo名稱>/`

## 注意事項

- `vendor/` 必須一起上傳，否則地圖不會顯示（原連結的 `vendor/` 是 404，此包已補上 Leaflet 1.9.4）
- 地圖圖磚來自 OpenStreetMap 免費服務，需使用者端有網路
- 所有資源都用相對路徑，放在子目錄（專案站台）也能正常運作
