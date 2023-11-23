const TruncateManual = (str, n) => {
	return str.length > n ? str.substring(0, n) + '...' : str;
};

export default TruncateManual;