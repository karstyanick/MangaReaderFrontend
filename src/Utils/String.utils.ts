export function decodeHtml(html: string) {
	const doc = new DOMParser().parseFromString(html, "text/html");
	return doc.documentElement.textContent ?? "";
}
