import 'dotenv/config';
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

console.log('RESEND_API_KEY:', import.meta.env.RESEND_API_KEY);
console.log('TURNSTILE_SECRET_KEY:', import.meta.env.TURNSTILE_SECRET_KEY);

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const TURNSTILE_SECRET_KEY = import.meta.env.TURNSTILE_SECRET_KEY;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        const turnstileResponse = formData.get('cf-turnstile-response');

        // verify Turnstile token
        const verification = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: TURNSTILE_SECRET_KEY,
                    response: turnstileResponse,
                }),
            }
        );

        const outcome = await verification.json();
        if (!outcome.success) {
            return new Response(
                JSON.stringify({ error: 'Invalid CAPTCHA' }),
                { status: 400 }
            );
        }

        // send email
        await resend.emails.send({
            from: 'Contact Form <noreply@salm.dev>',
            to: 'nico@salm.dev',
            subject: `New Contact Form Message from ${name}`,
            text: `
            Name: ${name}
            Email: ${email}
            Message:
            ${message}
            `,
        });

        return new Response(
            JSON.stringify({ message: 'Email sent successfully' }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to send message' }),
            { status: 500 }
        );
    }
}
