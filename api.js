export const ENDPOINT = {
    location: "http://localhost:8080",
};

async function sendJson(uri, payload) {
    let res = await fetch(ENDPOINT.location + uri, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    let data = await res.json();
    if (!res.ok) {
        throw new Error(data?.error);
    }
    return data;
}

export async function login({ email, password }) {
    let { token } = await sendJson("/admin/login", { email, password });
    return { token }
}

export async function register({ email, password }) {
    let { token } = await sendJson("/admin/register", { email, password });
    return { token }
}

export function classData() { 

}