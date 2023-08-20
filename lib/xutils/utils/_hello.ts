/**
 * Say Hello!
 * 
 * @param name
 */
export const _sayHello = (name?: string): string => {
	name = name?.length ? name : 'Thuku';
	const hello = `[x] - Hello ${name}!`;
	console.log(hello);
	return hello;
}