# เว็บอวยพรวันเกิดแม่

เว็บ static (HTML/CSS/JS ล้วน ไม่ต้องติดตั้งหรือ build อะไร) มีนับถอยหลัง พลุ ลูกโป่ง กระดาษโปรย มุมรูปภาพ และมุมคลิป

## โครงสร้างไฟล์

```
index.html      โครงหน้าเว็บ
style.css       หน้าตา
script.js       เอฟเฟกต์ (พลุ ลูกโป่ง กระดาษโปรย) นับถอยหลัง แกลเลอรี
config.js       เนื้อหาที่แก้ได้: ข้อความอวยพร รูป คลิป วันเกิด
assets/photos/  ใส่รูปที่นี่
assets/videos/  ใส่คลิปที่นี่
render.yaml     ตั้งค่า deploy บน Render
```

## ใส่รูปและคลิป

แก้ที่ `config.js` ไฟล์เดียว

1. ใส่รูปไว้ใน `assets/photos/` เช่น `01.jpg`
2. เพิ่มบรรทัดในลิสต์ `photos`

   ```js
   { src: 'assets/photos/01.jpg', caption: 'ทริปเชียงใหม่ ปี 2565' },
   ```

3. คลิปมี 2 แบบ
   - ไฟล์วิดีโอ: ใส่ใน `assets/videos/` แล้วเพิ่ม `{ src: 'assets/videos/01.mp4', title: 'ชื่อคลิป' }`
   - YouTube: อัปโหลดเป็น "ไม่แสดงในรายการ" แล้วเพิ่ม `{ youtube: 'รหัสวิดีโอ', title: 'ชื่อคลิป' }`

ข้อควรรู้เรื่องขนาดไฟล์

- GitHub ไม่รับไฟล์เกิน 100 MB และจะเตือนตั้งแต่ 50 MB ควรบีบวิดีโอให้ไม่เกิน 25 MB ต่อไฟล์ (ใช้ HandBrake หรือแอปบีบวิดีโอในมือถือ)
- คลิปยาวหรือไฟล์ใหญ่ ใช้ YouTube จะโหลดเร็วกว่าและไม่เปลืองพื้นที่
- รูปควรกว้างไม่เกิน 1600 px จะโหลดเร็วบนมือถือ

## ขึ้น GitHub

```bash
cd mom-birthday
git init
git add .
git commit -m "birthday site"
git branch -M main
git remote add origin https://github.com/<ชื่อผู้ใช้>/mom-birthday.git
git push -u origin main
```

ถ้าไม่ใช้ command line ให้สร้าง repository ใหม่บน github.com แล้วลากไฟล์ทั้งหมดในโฟลเดอร์นี้ไปวางในหน้า "Upload files" ก็ได้

## Deploy บน Render

1. เข้า [dashboard.render.com](https://dashboard.render.com) กด **New +** แล้วเลือก **Static Site**
2. เชื่อมบัญชี GitHub แล้วเลือก repository `mom-birthday`
3. ตั้งค่า
   - **Build Command**: เว้นว่างไว้ (หรือใส่ `echo "no build"`)
   - **Publish Directory**: `.`
4. กด **Create Static Site** รอสักครู่จะได้ลิงก์ `https://ชื่อ.onrender.com`

หลังจากนั้นทุกครั้งที่แก้ไฟล์แล้ว push ขึ้น GitHub Render จะอัปเดตเว็บให้เอง (ถ้าใช้ `render.yaml` ให้เลือก **New + > Blueprint** แทน)

## ทดลองในเครื่องก่อนขึ้นเว็บ

เปิด `index.html` ในเบราว์เซอร์ได้เลย หรือรัน server ง่าย ๆ

```bash
python3 -m http.server 8000
```

แล้วเปิด http://localhost:8000
