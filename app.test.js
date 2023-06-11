let url = 'http://localhost:' + 8080;

async function main() {
    let res = await fetch(url + '/admin/login', { method: 'POST', body: JSON.stringify({
        email: "Sakib@gamil.com",
        password: "12345678"
    }) });
    let data = await res.json();
    console.log(data);
}

console.clear()
main().catch(console.error)