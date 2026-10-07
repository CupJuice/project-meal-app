// ==========================================================================
// !! IMPORTANT !! ต้องแก้ไข 2 ค่านี้ให้เป็นของโปรเจกต์ Firebase ของตัวเอง
// ==========================================================================
// วิธีหาค่า:
// 1) FIREBASE_WEB_API_KEY
//    -> Firebase Console -> Project settings (รูปเฟือง) -> General -> Web API Key
// 2) FIREBASE_DB_URL
//    -> Firebase Console -> Build -> Realtime Database -> จะเห็น URL ด้านบนตาราง data
//    รูปแบบ: https://<project-id>-default-rtdb.<region>.firebasedatabase.app
//    (หรือ https://<project-id>-default-rtdb.firebaseio.com)
//
// อย่าลืม: Authentication -> Sign-in method -> เปิดใช้ Email/Password
//         Realtime Database -> Rules -> ตั้งเป็น auth.uid != null (อ่าน/เขียนได้เฉพาะผู้ที่ login แล้ว)
// ==========================================================================

export const FIREBASE_WEB_API_KEY = "";
export const FIREBASE_DB_URL = "";
