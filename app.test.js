require('dotenv').config();
const port = process.env.PORT || 5000;

let url = 'http://localhost:' +  port;

async function main() {
    let res = await fetch(url + '/class');
    let data = await res.json();
    console.log(data);
}

console.clear()
main().catch(console.error)