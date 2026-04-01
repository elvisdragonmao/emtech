import sharp from "sharp";

export const findRepresentativeColors = async (imagePath: string): Promise<{ colors: string[]; size: [number, number] } | null> => {
	const image = sharp(imagePath, { failOn: "none" });
	const metadata = await image.metadata();
	if (!metadata.width || !metadata.height) {
		return null;
	}

	const { data } = await image.ensureAlpha().resize({ width: 48, height: 48, fit: "inside" }).raw().toBuffer({ resolveWithObject: true });

	type Bucket = { count: number; r: number; g: number; b: number };
	const buckets = new Map<string, Bucket>();

	for (let index = 0; index < data.length; index += 4) {
		const alpha = data[index + 3];
		if (alpha < 80) continue;

		const red = data[index];
		const green = data[index + 1];
		const blue = data[index + 2];
		const key = `${Math.round(red / 32)}:${Math.round(green / 32)}:${Math.round(blue / 32)}`;
		const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
		bucket.count += 1;
		bucket.r += red;
		bucket.g += green;
		bucket.b += blue;
		buckets.set(key, bucket);
	}

	if (!buckets.size) {
		return null;
	}

	const colors = [...buckets.values()]
		.sort((left, right) => right.count - left.count)
		.slice(0, 3)
		.map(bucket => {
			const red = Math.round(bucket.r / bucket.count);
			const green = Math.round(bucket.g / bucket.count);
			const blue = Math.round(bucket.b / bucket.count);
			return `#${[red, green, blue].map(value => value.toString(16).padStart(2, "0")).join("")}`;
		});

	while (colors.length < 3) {
		colors.push(colors[colors.length - 1]);
	}

	return {
		colors,
		size: [metadata.width, metadata.height]
	};
};
