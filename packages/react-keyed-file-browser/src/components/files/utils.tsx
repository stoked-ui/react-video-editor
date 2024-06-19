function floatPrecision(floatValue: number | string, precision: number): string {
	let parsedValue = parseFloat(floatValue as string);
	if (isNaN(parsedValue)) {
		return parseFloat('0').toFixed(precision);
	} else {
		const power = Math.pow(10, precision);
		parsedValue = (Math.round(parsedValue * power) / power).toFixed(precision) as any;
		return parsedValue.toString();
	}
}

function fileSize(size: number): string {
	if (size > 1024) {
		const kbSize = size / 1024;
		if (kbSize > 1024) {
			const mbSize = kbSize / 1024;
			return `${floatPrecision(mbSize, 2)} MB`;
		}
		return `${Math.round(kbSize)} kB`;
	}
	return `${size} B`;
}

export { floatPrecision, fileSize };
