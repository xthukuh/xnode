import { _processArgs } from './xfs';
import { Term, _posInt, _wrapLines } from './xutils';

export const _run_test = async (): Promise<any> => {
	const args = _processArgs();
	Term.info('>> running test...');
	//-------------------------------------------------------------------------------
	
	// const text: string = [null, undefined].includes(value) ? '' : String(value);
	// const offset: number = Number.isInteger(index = parseInt(index as any)) && index >= 0 ? index : 0;
	// const pass: string = ([null, undefined].includes(key as any) ? '' : String(key)) || 'QWxvaG9tb3JhIQ';
	// let buffer: string = '';
	// for (let i = 0; i < text.length; i ++){
	// 	const char: string = String.fromCharCode(text[i].charCodeAt(0) ^ (pass[(offset + i) % pass.length].charCodeAt(0) ** 2));
	// 	buffer += char;
	// }
	// return buffer;

	const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida consectetur orci ut viverra. Morbi elementum, felis vel iaculis mattis, ante arcu accumsan lectus, sed finibus ligula dui posuere eros. Aliquam erat volutpat. Nunc vehicula vehicula nibh, nec consequat purus sollicitudin sit amet. Morbi vulputate congue venenatis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam odio augue, scelerisque quis sagittis vel, egestas ac mauris. Curabitur ac libero sollicitudin, mollis nulla vel, volutpat orci. Donec sagittis vulputate ipsum, non sollicitudin urna dapibus quis. Nunc molestie semper vestibulum. Sed scelerisque ligula risus, a facilisis eros maximus eu. Suspendisse sit amet felis eu ipsum eleifend varius at a mauris. Aenean pretium eros ut est blandit aliquet. Integer gravida tincidunt justo id faucibus. Proin augue orci, placerat et risus at, vehicula hendrerit nunc.';
	Term.log(text);
	Term.log(text.length);
	const lines = _wrapLines(text, _posInt(args['--test'], 0) ?? 0, !!args['--word-break'], v => '#  ' + v);
	lines.forEach(line => {
		console.log(`-- ${Term.format(['info'], `"${line}"`).values().join('')} [${line.length}]`);
		// .format(['log'], line.length).log();
	});
	
	
	
	//..
	Term.success('done.');
};