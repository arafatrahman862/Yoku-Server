import { ENDPOINT, login, register } from "./api.js";

ENDPOINT.location = "http://localhost:8080"

const adminData = { email: "test@gmail.com", password: "1234" };

login(adminData).catch(err => console.log("Login without register"))
register(adminData).then(data => console.log("Register:", data))
register(adminData).catch(err => console.log("Register Again Failed1"))
login(adminData).then(data => console.log("Login sussful", data))

