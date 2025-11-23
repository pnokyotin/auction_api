// import bcrypt from 'bcrypt';

// const hash = '$2b$10$wlEJxymTjZ1J7kg8U6L6kOgnbIYk0lK0kZp9Q5Unlrx8knmP4r0bG';
// const password = 'staff123';

// async function checkPassword() {
//   const match = await bcrypt.compare(password, hash);
//   console.log(match); // true หรือ false
// }

// checkPassword();


// import bcrypt from 'bcrypt';

// async function generateHash() {
//   const password = 'staff123'; // รหัสผ่านที่ต้องการใช้
//   const hash = await bcrypt.hash(password, 10);
//   console.log(hash);
// }

// generateHash();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve public/images
app.use("/images", express.static(path.join(__dirname, "public/images")));

