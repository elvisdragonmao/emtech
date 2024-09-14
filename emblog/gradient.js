const sharp = require('sharp');

async function calculateAverageColor(imagePath, region) {
  const { width, height } = await sharp(imagePath).metadata();
  
  // 定義各區域
  const regions = {
    topLeft: { left: 0, top: 0, width: Math.floor(width / 3), height: Math.floor(height / 3) },
    center: { left: Math.floor(width / 3), top: Math.floor(height / 3), width: Math.floor(width / 3), height: Math.floor(height / 3) },
    bottomRight: { left: Math.floor(2 * width / 3), top: Math.floor(2 * height / 3), width: Math.floor(width / 3), height: Math.floor(height / 3) }
  };

  const regionInfo = regions[region];
  
  // 確認區域大小是否足夠
  const extracted = await sharp(imagePath)
    .extract(regionInfo)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const data = extracted.data;
  const pixelCount = data.length / 4; // 總像素數 (每個像素佔 4 個字節: RGBA)
  
  // 設定 sampleSize 為不超過總像素數
  const sampleSize = Math.min(10, pixelCount);

  const colors = {};

  // 取樣像素顏色
  for (let i = 0; i < sampleSize; i++) {
    const pixelIndex = i * 4; // RGBA 每個像素佔 4 個字節
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];

    const colorKey = `${r},${g},${b}`;

    if (colors[colorKey]) {
      colors[colorKey]++;
    } else {
      colors[colorKey] = 1;
    }
  }

  // 找到最常出現的顏色
  const mostFrequentColor = Object.keys(colors).reduce((a, b) => (colors[a] > colors[b] ? a : b));
  // turn to hex
  const mostFrequentColorHex = mostFrequentColor.split(',').map((c) => parseInt(c).toString(16)).join(''); // rgb to hex
  return "#" + mostFrequentColorHex;
}

async function findRepresentativeColors(imagePath) {
  const topLeftColor = await calculateAverageColor(imagePath, 'topLeft');
  const centerColor = await calculateAverageColor(imagePath, 'center');
  const bottomRightColor = await calculateAverageColor(imagePath, 'bottomRight');

  console.log('Top Left Color:', topLeftColor);
  console.log('Center Color:', centerColor);
  console.log('Bottom Right Color:', bottomRightColor);
  console.log(`<div style="width: 100px; height: 100px; background: linear-gradient(135deg, ${topLeftColor}, ${centerColor}, ${bottomRightColor});"></div>`);
}

findRepresentativeColors('dist/static/7zip/thumbnail.webp');
