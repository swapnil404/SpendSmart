import { auth } from "../auth";

async function main() {
    const baseURL = (auth as any).options.baseURL;
    console.log("Configured Base URL:", baseURL);

    console.log("--- TEST 1: forget-password ---");
    await testRoute(`${baseURL}/forget-password`);

    console.log("\n--- TEST 2: forgot-password ---");
    await testRoute(`${baseURL}/forgot-password`);

    console.log("\n--- TEST 3: sign-up/email (Control) ---");
    await testRoute(`${baseURL}/sign-up/email`, {
        email: "test-control@example.com",
        password: "password123",
        name: "Test User"
    });
}

async function testRoute(url: string, body: any = { email: "test@example.com" }) {
    const req = new Request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    try {
        const res = await auth.handler(req);
        console.log(`[${url}] Status:`, res.status);
    } catch (e) {
        console.error(`[${url}] Error:`, e);
    }
}

main();
