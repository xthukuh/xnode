import { _parseIgnore } from './_parse_ignore';
import { _dirPath, _normSep, _print } from './__utils';
import { _exists, _filetype, _hashFile, _hashes, _mkdir, _processArgs } from './xfs';
import { Term, _asyncQueue, _basename, _batchValues, _errorText, _filepath, _jsonStringify, _str } from './xutils';

//Backup
export const _run_backup = async (): Promise<any> => {
	return (async (): Promise<any> => {
		try {
			
			//-- parse args
			let tmp: any;
			const args = _processArgs();
			const source: string = _str(args['--backup'], true);
			const destination: string = _str(args['--to'], true);
			const output: string = (tmp = _basename(args['--out']).toString().replace(/\.+json$/i, '').trim()) ? tmp + '.json' : '';
			Term.info('>> running backup...', {source, destination, output});
			
			//-- verify directories
			Term.debug('>> verifying backup directories...');
			if (!(tmp = _dirPath(source, true))) throw new TypeError('The backup source directory path is invalid!');
			const source_dir: string = _normSep(tmp);
			let dest_dir: string = _filepath(destination).toString();
			if (!dest_dir) throw new TypeError('The backup destination directory path is invalid!');
			const dest_exists: 0|1|2|3 = _filetype(dest_dir);
			if (!dest_exists){
				Term.debug(`>> creating destination directory... (${dest_dir})`);
				const res = _mkdir(dest_dir);
				if (!res) throw new TypeError(`Failed to get backup destination folder (${dest_dir}).`);
				dest_dir = res;
			}
			dest_dir = _normSep(dest_dir);

			//-- ready
			Term.debug(`<< ready - backup source       :  "${source_dir}"`);
			Term.debug(`<< ready - backup destination  :  "${dest_dir}"`);
			return Term.warn('HALT DEBUG!');

			//-- parse source contents
			Term.debug(`>> parsing source directory contents... (${source_dir})`);
			const paths: string[] = await _parseIgnore(source, false, true, '/');
			Term.debug(`<< found ${paths.length} items.`);
	
			//-- calculate file changes
			Term.log('>> calculating files...');
			const items: {[key: string]: any}[] = [];
			await _asyncQueue(paths, 20, async (path, i, len) => {
				const from: string = source_dir + '/' + path;
				const to: string = dest_dir + '/' + path;
				const from_type: any = _filetype(from);
				let to_type: any = undefined;
				let skip: boolean = false;
				let skip_reason: string = '';
				let exists: boolean = false;
				if (!!(exists = _exists(to))){
					to_type = _filetype(to);
					if (from_type >= 2 && to_type >= 2){
						skip = true;
						skip_reason = 'subfolder';
					}
					else if (from_type !== to_type){
						skip = true;
						skip_reason = `mismatch ${from_type + ' => ' + to_type}`;
					}
					else if (from_type === 1){
						Term.debug(`>> calc [${i + 1}/${len}] "${from}" (${from_type})`);
						Term.debug(`   => "${to}" (${to_type})...`);
						const from_hash = await _hashFile(from, 'sha256');
						const to_hash = await _hashFile(to, 'sha256');
						Term.debug(`   [from_hash] "${from_hash}"`);
						Term.debug(`   [to_hash]   "${to_hash}"`);
						const same = from_hash === to_hash;
						Term[same ? 'debug': 'log'](`  [same]       ${same}`);
						if (same){
							skip = true;
							skip_reason = 'unchanged';
						}
					}
				}
				items[i] = {
					index: i,
					from,
					from_type,
					to,
					to_type,
					skip,
					skip_reason,
					exists,
				};
			});
			Term.info('<< debug backup items:');
			Term.log(_jsonStringify(items, 2));
		}
		catch (e: any){
			throw e;
		}
	})()
	.catch((e: any) => {
		Term.error(`[E] Backup copy failure!`, e);
	});
};