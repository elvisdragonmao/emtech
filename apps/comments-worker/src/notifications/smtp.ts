import { isValidEmail } from "@emtech/comments-shared";
import { connect } from "cloudflare:sockets";
import type { Env } from "../types";

export type SmtpMessage = {
	to: string;
	subject: string;
	html: string;
	text: string;
	unsubscribeUrl?: string;
};

type SmtpConfig = {
	host: string;
	port: number;
	username: string;
	password: string;
	security: "tls" | "starttls" | "off";
	fromEmail: string;
	fromName: string;
};

export async function sendSmtpMessages(env: Env, messages: SmtpMessage[]): Promise<void> {
	if (!messages.length) return;
	const config = smtpConfig(env);
	if (!config) return;

	let socket = connect({ hostname: config.host, port: config.port }, { secureTransport: config.security === "tls" ? "on" : config.security === "starttls" ? "starttls" : "off", allowHalfOpen: false });
	let session = new SmtpSession(socket);

	try {
		await socket.opened;
		await session.expect([220]);
		let capabilities = await session.command(`EHLO ${smtpClientHostname(config.fromEmail)}`, [250]);

		if (config.security === "starttls") {
			if (!capabilities.some(line => /\bSTARTTLS\b/i.test(line))) throw new Error("SMTP server does not advertise STARTTLS");
			await session.command("STARTTLS", [220]);
			session.release();
			socket = socket.startTls({ expectedServerHostname: config.host });
			session = new SmtpSession(socket);
			await socket.opened;
			capabilities = await session.command(`EHLO ${smtpClientHostname(config.fromEmail)}`, [250]);
		}

		if (config.username || config.password) await authenticate(session, capabilities, config.username, config.password);

		for (const message of messages) {
			if (!isValidEmail(message.to)) continue;
			await session.command(`MAIL FROM:<${config.fromEmail}>`, [250]);
			await session.command(`RCPT TO:<${message.to}>`, [250, 251, 252]);
			await session.command("DATA", [354]);
			await session.write(`${dotStuff(renderMimeMessage(config, message))}\r\n.\r\n`);
			await session.expect([250]);
		}

		await session.command("QUIT", [221]);
	} finally {
		session.release();
		await socket.close().catch(() => undefined);
	}
}

export function smtpConfig(env: Env): SmtpConfig | null {
	if (!env.SMTP_HOST || !env.SMTP_FROM_EMAIL) return null;
	const port = Number(env.SMTP_PORT ?? "587");
	const security = env.SMTP_SECURITY ?? (port === 465 ? "tls" : "starttls");
	if (!Number.isInteger(port) || port < 1 || port > 65535 || port === 25) throw new Error("SMTP_PORT must be a valid non-25 port");
	if (security !== "tls" && security !== "starttls" && security !== "off") throw new Error("SMTP_SECURITY must be tls, starttls, or off");
	if (security === "off" && !isLoopbackHost(env.SMTP_HOST)) throw new Error("Unencrypted SMTP is only allowed on loopback hosts");
	if (!isValidEmail(env.SMTP_FROM_EMAIL)) throw new Error("SMTP_FROM_EMAIL is invalid");

	return {
		host: env.SMTP_HOST,
		port,
		username: env.SMTP_USERNAME ?? "",
		password: env.SMTP_PASSWORD ?? "",
		security,
		fromEmail: env.SMTP_FROM_EMAIL,
		fromName: sanitizeHeader(env.SMTP_FROM_NAME ?? "毛哥EM資訊密技")
	};
}

class SmtpSession {
	private readonly decoder = new TextDecoder();
	private readonly encoder = new TextEncoder();
	private readonly reader: ReadableStreamDefaultReader<Uint8Array>;
	private readonly writer: WritableStreamDefaultWriter<Uint8Array>;
	private buffer = "";
	private released = false;

	constructor(socket: Socket) {
		this.reader = socket.readable.getReader() as ReadableStreamDefaultReader<Uint8Array>;
		this.writer = socket.writable.getWriter() as WritableStreamDefaultWriter<Uint8Array>;
	}

	async command(command: string, expected: number[]): Promise<string[]> {
		await this.write(`${command}\r\n`);
		return this.expect(expected);
	}

	async write(value: string): Promise<void> {
		await this.writer.write(this.encoder.encode(value));
	}

	async expect(expected: number[]): Promise<string[]> {
		const lines: string[] = [];
		while (true) {
			const end = this.buffer.indexOf("\r\n");
			if (end >= 0) {
				const line = this.buffer.slice(0, end);
				this.buffer = this.buffer.slice(end + 2);
				lines.push(line);
				const final = line.match(/^(\d{3}) /);
				if (!final?.[1]) continue;
				const code = Number(final[1]);
				if (!expected.includes(code)) throw new Error(`SMTP command failed with ${code}: ${lines.join(" | ")}`);
				return lines;
			}

			const chunk = await this.reader.read();
			if (chunk.done) throw new Error("SMTP connection closed before a complete response");
			this.buffer += this.decoder.decode(chunk.value, { stream: true });
		}
	}

	release(): void {
		if (this.released) return;
		this.released = true;
		this.reader.releaseLock();
		this.writer.releaseLock();
	}
}

async function authenticate(session: SmtpSession, capabilities: string[], username: string, password: string): Promise<void> {
	const supported = capabilities.join(" ").toUpperCase();
	if (supported.includes("PLAIN")) {
		const token = base64Utf8(`\0${username}\0${password}`);
		const response = await session.command(`AUTH PLAIN ${token}`, [235, 334]);
		if (response.at(-1)?.startsWith("334")) {
			await session.command(token, [235]);
		}
		return;
	}
	if (supported.includes("LOGIN")) {
		await session.command("AUTH LOGIN", [334]);
		await session.command(base64Utf8(username), [334]);
		await session.command(base64Utf8(password), [235]);
		return;
	}
	throw new Error("SMTP server does not advertise AUTH PLAIN or AUTH LOGIN");
}

function renderMimeMessage(config: SmtpConfig, message: SmtpMessage): string {
	const boundary = `emtech-${crypto.randomUUID()}`;
	const headers = [
		`From: ${encodeHeader(config.fromName)} <${config.fromEmail}>`,
		`To: <${message.to}>`,
		`Subject: ${encodeHeader(sanitizeHeader(message.subject))}`,
		`Date: ${new Date().toUTCString()}`,
		`Message-ID: <${crypto.randomUUID()}@${smtpClientHostname(config.fromEmail)}>`,
		"MIME-Version: 1.0",
		`Content-Type: multipart/alternative; boundary="${boundary}"`
	];
	if (message.unsubscribeUrl) {
		headers.push(`List-Unsubscribe: <${message.unsubscribeUrl}>`, "List-Unsubscribe-Post: List-Unsubscribe=One-Click");
	}

	return [
		...headers,
		"",
		`--${boundary}`,
		'Content-Type: text/plain; charset="UTF-8"',
		"Content-Transfer-Encoding: base64",
		"",
		base64Mime(message.text),
		`--${boundary}`,
		'Content-Type: text/html; charset="UTF-8"',
		"Content-Transfer-Encoding: base64",
		"",
		base64Mime(message.html),
		`--${boundary}--`
	].join("\r\n");
}

function base64Utf8(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

function base64Mime(value: string): string {
	return (
		base64Utf8(value)
			.match(/.{1,76}/g)
			?.join("\r\n") ?? ""
	);
}

function encodeHeader(value: string): string {
	return /^[\x20-\x7E]*$/.test(value) ? value : `=?UTF-8?B?${base64Utf8(value)}?=`;
}

function sanitizeHeader(value: string): string {
	return value.replace(/[\r\n]+/g, " ").trim();
}

function dotStuff(value: string): string {
	return value.replace(/(^|\r\n)\./g, "$1..");
}

function smtpClientHostname(fromEmail: string): string {
	return fromEmail.split("@")[1] ?? "emtech.cc";
}

function isLoopbackHost(host: string): boolean {
	return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
}
