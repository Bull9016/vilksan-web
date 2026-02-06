"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function subscribeToNewsletter(email: string, name?: string) {
    if (!email || !email.includes("@")) {
        throw new Error("Invalid email address");
    }

    try {
        const { error } = await supabase.from("subscribers").insert([{
            email,
            name // Optional name
        }]);

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: true, message: "You're already on the list!" };
            }
            throw error;
        }
        return { success: true, message: "Welcome to the club." };
    } catch (error) {
        console.error("Newsletter error:", error);
        throw new Error("Failed to subscribe. Please try again.");
    }
}
