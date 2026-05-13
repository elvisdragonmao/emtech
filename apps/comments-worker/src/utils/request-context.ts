type CloudflareRequestMetadata = {
	city?: string;
	region?: string;
	country?: string;
};

export type PublicRequestContext = {
	deviceLabel: string | null;
	browserLabel: string | null;
	locationLabel: string | null;
};

export function publicRequestContext(request: Request): PublicRequestContext {
	const userAgent = request.headers.get("User-Agent") ?? "";
	const cf = (request as Request & { cf?: CloudflareRequestMetadata }).cf;

	return {
		deviceLabel: deviceLabel(userAgent),
		browserLabel: browserLabel(userAgent),
		locationLabel: locationLabel(cf)
	};
}

export function browserLabel(userAgent: string): string | null {
	if (!userAgent) return null;
	if (/Edg\//.test(userAgent)) return "Edge";
	if (/Firefox\//.test(userAgent)) return "Firefox";
	if (/OPR\//.test(userAgent) || /Opera\//.test(userAgent)) return "Opera";
	if (/CriOS\//.test(userAgent) || /Chrome\//.test(userAgent)) return "Chrome";
	if (/Safari\//.test(userAgent)) return "Safari";
	return null;
}

export function deviceLabel(userAgent: string): string | null {
	if (!userAgent) return null;
	if (/iPhone/.test(userAgent)) return "iPhone";
	if (/iPad/.test(userAgent)) return "iPad";
	if (/Android/.test(userAgent)) return /Mobile/.test(userAgent) ? "Android Phone" : "Android";
	if (/Macintosh|Mac OS X/.test(userAgent)) return "Mac";
	if (/Windows/.test(userAgent)) return "Windows PC";
	if (/Linux/.test(userAgent)) return "Linux";
	return null;
}

export function locationLabel(cf: CloudflareRequestMetadata | undefined): string | null {
	if (!cf) return null;
	const parts = [cf.city, cf.region, cf.country].filter((part): part is string => Boolean(part?.trim()));
	if (parts.length === 0) return null;
	return [...new Set(parts)].join(", ");
}
