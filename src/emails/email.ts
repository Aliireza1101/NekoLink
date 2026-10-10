import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const templatePath = path.join(
    process.cwd(),
    "src",
    "emails",
    "templates",
    "forgot-password.html",
);

export const sendForgotPasswordEmail = async (
    to: string,
    firstName: string,
    resetUrl: string,
) => {
    let html = await readFile(templatePath, "utf-8");

    html = html
        .replaceAll("{{firstName}}", firstName)
        .replaceAll("{{resetUrl}}", resetUrl)
        .replaceAll("{{appName}}", "NekoLink")
        .replaceAll("{{year}}", String(new Date().getFullYear()));

    return await resend.emails.send({
        from: "NekoLink <onboarding@resend.dev>",
        to,
        subject: "Reset Your Password",
        html,
    });
};
