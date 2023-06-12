import { ADMIN_OR_INSTRUCTOR, STUDENT, CLASS, client } from "./src/database.js";
await Promise.allSettled([
    STUDENT.deleteMany({}),
    ADMIN_OR_INSTRUCTOR.deleteMany({}),
    CLASS.deleteOne({ _id: "test_data" })
])
client.close();

import assert from 'node:assert/strict';

// ------------------------------------------------------------------

import * as api from "../assingment12-client/src/api.js";

const adminData = { email: "adminn@gmail.com", password: "1234", role: 'admin' };

await assert.rejects(() => api.login(adminData), 'Login without register should failed');
console.log('Admin Register successful:', await api.register(adminData));
await assert.rejects(() => api.register(adminData), 'Register again  should failed');
const adminAuth = await api.login(adminData);
console.log('Admin Login successful:', await api.login(adminData));

// ------------------------------------------------------------------

await assert.rejects(() => api.promoteUser({ email: '', role: '' }, ""), 'Should failed: Because of invalid admin auth token');

const instructorData = { email: "instructor@gmail.com", password: "1234", role: 'instructor' };
const instructorAuth = await api.register(instructorData);
console.log("Instructor promoted to admin! ", await api.promoteUser({ email: instructorData.email, role: 'admin' }, adminAuth.token));

// ------------------------------------------------------------------

console.log('Available Seats:', await api.availableSeats());

const classData = {
    _id: 'test_data',
    img: "https://a6e8z9v6.stackpathcdn.com/yoku/demo1/wp-content/uploads/sites/2/2019/01/shutterstock_1556637371-950x1075.jpg",
    class_name: "Do Yoga!",
    instructor_name: "Homes",
    available_seat: 20,
    price: 22
};
await api.addClass(classData, instructorAuth.token)
console.log('New class added');