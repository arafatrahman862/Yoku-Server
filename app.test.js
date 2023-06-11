import { ADMIN, client } from "./src/database.js";
import assert from 'node:assert/strict';

await ADMIN.deleteMany({});

import * as api from "./api.js";

api.ENDPOINT.location = "http://localhost:8080"

const adminData = { email: "adminn@gmail.com", password: "1234" };

await assert.rejects(() => api.login(adminData), 'Login without register should failed');
console.log('Admin Register successful:', await api.register(adminData));
await assert.rejects(() => api.register(adminData), 'Register again  should failed');
let adminAuth = await api.login(adminData);
console.log('Admin Login successful:', await api.login(adminData));

// ------------------------------------------------------------------

await assert.rejects(() => api.promoteUser({ email: '', role: '' }, ""), 'Should failed: Because of invalid admin auth token');

const instructorData = { email: "instructor@gmail.com", password: "1234" };
await api.register(instructorData);
console.log("Instructor promoted to admin! ", await api.promoteUser({ email: instructorData.email, role: 'admin' }, adminAuth.token));

await client.close()

