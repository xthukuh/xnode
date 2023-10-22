import { _parseIgnore } from './_parse_ignore';
import { _dirPath, _normSep, _print } from './_utils';
import { _exists, _filetype, _hashFile, _hashes, _mkdir } from './xfs';
import { Term, _asyncQueue, _batchValues, _errorText, _filepath, _jsonStringify } from './xutils';

//Backup
export const _backupCopy = async (source: string, destination: string): Promise<any> => {
	try {
		Term.debug('PARSE IGNORE BACKUP > checking paths...', {source, destination});
		
		//-- validate source dir
		if (!(source = _dirPath(source, true, 'backup source dir'))) return;
		const source_dir: string = _normSep(source);
		
		//-- check dest dir
		let dest_dir: string = _filepath(destination).toString();
		if (!dest_dir) throw new TypeError(`Invalid backup destination folder path (${destination}).`);
		const dest_type: 0|1|2|3 = _filetype(dest_dir); 
		if (!dest_type){
			Term.debug(`>> creating destination directory... (${dest_dir})`);
			const res = _mkdir(dest_dir);
			if (!res) throw new TypeError(`Failed to get backup destination folder (${dest_dir}).`);
			dest_dir = res;
		}
		dest_dir = _normSep(dest_dir);
		Term.info(`[FROM] "${source_dir}" [TO] "${dest_dir}"`);

		//-- parse source
		Term.log(`>> parsing source directory contents... (${source_dir})`);
		const paths: string[] = await _parseIgnore(source, false, true, '/');
		Term.debug(`<< found ${paths.length} items.`);

		//-- calculate changes
		Term.log('>> calc changes...');
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
		Term.error(`[E] Backup copy failure; ${_errorText(e)}`);
	}
};