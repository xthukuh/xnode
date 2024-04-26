/**
 * RC4 encrypt/decrypt text value
 * 
 * @param text - parse text
 * @param key - cypher key (default: `'alohomora'`)
 * @returns `string`
 */
export const _rc4 = (text: any, key?: string): string => {
	if (!(text = String(text ?? ''))) return '';
	key = String(key ?? 'alohomora');
	const S: any[] = [], K: any[] = [];
	for (let i = 0; i < 256; i++){
		S[i] = i;
		K[i] = key.charCodeAt(i % key.length);
	}
	let j = 0;
	for (let i = 0; i < 256; i++) {
		j = (j + S[i] + K[i]) % 256;
		[S[i], S[j]] = [S[j], S[i]];
	}
	let result = '', i = 0; j = 0;
	for (let n = 0; n < text.length; n++) {
		i = (i + 1) % 256;
		j = (j + S[i]) % 256;
		[S[i], S[j]] = [S[j], S[i]];
		const keystream = S[(S[i] + S[j]) % 256];
		result += String.fromCharCode(text.charCodeAt(n) ^ keystream);
	}
	return result;
};