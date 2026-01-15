import { auth } from "../auth";

console.log("Inspecting Better Auth instance...");
try {
    // Better Auth instance usually has an 'api' or 'options' property
    // We want to see if we can find the registered routes.
    // In some versions, auth.api is the router.
    
    // Attempt to log relevant keys
    console.log("Keys:", Object.keys(auth));
    
    if ('api' in auth) {
        console.log("API keys:", Object.keys((auth as any).api));
    }
    
    if ('options' in auth) {
         const options = (auth as any).options;
         console.log("Email and Password enabled:", options.emailAndPassword?.enabled);
    }

} catch (e) {
    console.error("Error inspecting auth:", e);
}
