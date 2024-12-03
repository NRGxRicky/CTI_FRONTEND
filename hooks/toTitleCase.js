function toTitleCase(text) {
	return text.toLowerCase().map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default toTitleCase;