# สิ่งที่เพิ่มเข้าไปในโปรเจกต์ (Meals App)

โปรเจกต์เดิมเป็นแอปเมนูอาหาร (Categories / Meal Detail / Favorites / Orders)
ได้เพิ่ม 2 ส่วนตามข้อกำหนด ดังนี้

- **1.4 Backend database (cloud data store)** → Firebase Realtime Database
  ใช้เก็บรายการ "Favorite" ของผู้ใช้แต่ละคน (sync ระหว่างเครื่อง/ครั้งที่เปิดแอป)
- **1.5 User authentication (login)** → Firebase Authentication (Email/Password)
  ผ่าน REST API เหมือนในสไลด์ rn12 (ไม่ต้องติดตั้ง Firebase SDK)
- **1.3 Context (memory data store)** ของเดิม (`favorite-context.js`) ยังอยู่ครบ
  แต่ปรับให้ดึงข้อมูลจาก Firebase มาไว้ใน context ตอน login และ sync กลับไปที่
  Firebase ทุกครั้งที่กดหัวใจ/ดาว (favorite)

## ไฟล์ที่เพิ่ม/แก้ไข

```
util/firebaseConfig.js        <-- ต้องใส่ Web API Key และ Database URL ของตัวเอง
util/auth.js                  <-- signup/login ผ่าน Firebase Auth REST API
util/http.js                  <-- อ่าน/เขียน/ลบ favorites ใน Realtime Database
store/context/auth-context.js <-- เก็บ token/userId + auto-login (AsyncStorage)
store/context/favorite-context.js (แก้ไข) <-- sync กับ Firebase
components/Auth/*              <-- ฟอร์ม login/signup (Input, Button, FlatButton, AuthForm, AuthContent)
components/ui/LoadingOverlay.js
screens/LoginScreen.js
screens/SignupScreen.js
App.js (แก้ไข)                 <-- แยกเป็น AuthStack / AuthenticatedStack + ปุ่ม logout
constants/colors.js
```

## ต้องทำก่อนรันโปรเจกต์ (สำคัญมาก)

### 1) สร้างโปรเจกต์ Firebase
ไปที่ https://firebase.google.com/ → Add project → ตั้งชื่อ เช่น `my-meals-app`

### 2) เปิดใช้งาน Authentication
Build → Authentication → Get started → Sign-in method → เปิด **Email/Password**

### 3) สร้าง Realtime Database
Build → Realtime Database → Create Database → เลือก region → **Start in test mode**
(ทดสอบผ่านก่อน แล้วค่อยตั้ง Rules ให้รัดกุมตามข้อ 5)

### 4) คัดลอกค่า 2 ตัวมาใส่ใน `util/firebaseConfig.js`
- **Web API Key**: Project settings (รูปเฟือง) → General → Web API Key
- **Database URL**: หน้า Realtime Database → คัดลอก URL ที่อยู่ด้านบนของตาราง data
  (รูปแบบ `https://<project-id>-default-rtdb.firebaseio.com` หรือ
  `https://<project-id>-default-rtdb.<region>.firebasedatabase.app`)

```js
export const FIREBASE_WEB_API_KEY = "AIzaSy........................";
export const FIREBASE_DB_URL = "https://my-meals-app-default-rtdb.firebaseio.com";
```

### 5) ตั้งค่า Rules ให้เข้าถึงได้เฉพาะผู้ที่ login แล้ว
Realtime Database → Rules → แก้เป็น

```json
{
  "rules": {
    ".read": "auth.uid != null",
    ".write": "auth.uid != null"
  }
}
```
แล้วกด Publish

### 6) ติดตั้ง dependency ที่เพิ่มเข้ามา
```
npm install
```
(เพิ่ม `axios` และ `@react-native-async-storage/async-storage` ใน package.json แล้ว)

### 7) รันแอป
```
npx run android
```

## พฤติกรรมของแอปหลังแก้ไข

1. เปิดแอปครั้งแรก → เจอหน้า **Login** (ยังไม่เคย login มาก่อน)
2. กด "Create a new user" → กรอกอีเมล/รหัสผ่าน → **Sign Up** → เข้าแอปหลักได้ทันที
3. กดหัวใจ/ดาว favorite เมนูใดๆ → บันทึกลง Firebase Realtime Database
   ใต้ path `favorites/<userId>/<mealId>`
4. กดปุ่ม logout (ไอคอน exit มุมขวาบน) → เด้งกลับไปหน้า Login
   และ favorites ในหน่วยความจำจะถูกล้าง
5. Login ใหม่ (หรือปิดแอปแล้วเปิดใหม่โดยไม่ logout) → favorites จะถูกดึงกลับมาอัตโนมัติ
   จาก Firebase (auto-login ด้วย token ที่เก็บไว้ใน AsyncStorage)

## ปรับแต่งเพิ่มเติมได้ตามต้องการ
- เพิ่ม `ErrorOverlay` แสดง error message แทน `Alert.alert` (ตามสไลด์ assignment ท้าย rn11)
- เพิ่มหน้า Loading/ActivityIndicator ตอนดึง favorites (ตามสไลด์ assignment ท้าย rn11)
- เพิ่ม field ชื่อผู้ใช้ (displayName) เก็บลง Realtime Database ตอน signup
