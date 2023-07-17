import { Term } from 'xutils';
import { _watcher } from '../lib/watcher';

(async()=>{

	//result
	let next: number = 1;

	//handle command - watcher
	next = await _watcher().then(res => !!res ? 0 : 1);
	if (!next) return; //next/done

	//..
})()
.then(() => {
	console.log('');
	Term.success('>> done.');
});