import { _parseIgnore } from './_parse_ignore';
import { ProgTerm, _dirPath, _normSep, _print } from './__utils';
import { IPathInfo, _exists,  _hashFile, _hashes, _renamePath, _mkdir, _pathinfo, _processArgs, _copyFile } from './xfs';
import { Term, _asyncQueue, _basename, _batchValues, _bytesText, _errorText, _filepath, _jsonStringify, _str } from './xutils';

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
			const dest_info: IPathInfo|undefined = _pathinfo(dest_dir, 2);
			if (!dest_info){
				Term.debug(`>> Creating destination directory... (${dest_dir})`);
				const res = _mkdir(dest_dir);
				if (!res) throw new TypeError(`Unable to create backup destination directory (${dest_dir}).`);
				dest_dir = res;
			}
			else {
				if (!dest_info.isDirectory) throw new TypeError(`The destination directory path is not a folder. "${dest_info.path_full}" (type = ${dest_info.type})`);
				dest_dir = dest_info.target;
			}
			dest_dir = _normSep(dest_dir);

			//-- ready
			Term.debug(`<< ready - backup source       :  "${source_dir}"`);
			Term.debug(`<< ready - backup destination  :  "${dest_dir}"`);
			// return Term.warn('HALT DEBUG!');

			//-- parse source contents
			Term.debug(`>> parsing source directory contents... (${source_dir})`);
			const paths: string[] = await _parseIgnore(source, false, true, '/');
			Term.debug(`<< found ${paths.length} items.`);
	
			//-- calculate file changes
			Term.log('>> calculating files...');
			let count: number = 0;
			let copy_size: number = 0;
			let copy_files: number = 0;
			const logger = new ProgTerm();
			const entries: [string,string][] = [];
			await _asyncQueue(paths, 20, async (path, i, len) => {
				count ++;
				const percent = count/len * 100;
				logger.set(percent, `calculating ${len} items...`);
				const from: string = source_dir + '/' + path;
				let to: string = dest_dir + '/' + path;
				const from_info: IPathInfo|undefined = _pathinfo(from);
				if (!from_info){
					logger.error(`Failed to get backup source path info! (${from})`);
					return;
				}
				let to_info: IPathInfo|undefined = _pathinfo(to);
				if (to_info){
					if (from_info.type !== to_info.type){
						let error = `source-destination type mismatch! ("${path}" => ${from_info.type} <> ${to_info.type})`;
						if (from_info.type === 2){
							logger.error('SKIPPED - Existing directory ' + error);
							return;
						}
						const to_renamed: string = _renamePath(to);
						error = 'RENAMED - Existing file ' + error + `\n-- "${to}" => "${to_renamed}"`;
						logger.warn(error);
						to = to_renamed;
						to_info = undefined;
					}
					else if (from_info.type === 1){
						logger.debug(`Calculating sha256 hashes... (${path})`);
						const from_hash = await _hashFile(from, 'sha256');
						const to_hash = await _hashFile(to, 'sha256');
						if (from_hash === to_hash){
							logger.debug('SKIPPED - file unchanged');
							return;
						}
						logger.debug(`++ CHANGED - file "${path}" (${_bytesText(from_info.size)})`);
					}
					else if (from_info.type === 2){
						logger.debug('SKIPPED - directory exists');
						return;
					}
				}
				if (!to_info) logger.debug(`++ ADDED - ${from_info.type === 1 ? 'file' : 'directory'} "${path}"${from_info.type === 1 ? ' (' + _bytesText(from_info.size, 2) + ')' : ''}`);
				if (from_info && from_info.type === 1){
					copy_size += from_info.size;
					copy_files ++
				}
				entries.push([from, to]);
			});
			logger
			.set(0, 'Copying...')
			.info(`>> backup copy... (${entries.length} entries, ${copy_files} files ${_bytesText(copy_size)})`);
			count = 0;
			let buffer_size: number = 0;
			await _asyncQueue(entries, 20, async (entry, i, len) => {
				const [copy_from, copy_to] = entry;
				count ++;
				const percent = (((count/len) + (buffer_size/copy_size))/2 * 100);
				logger
				.set(percent, `Coping ${count}/${len} - ${_bytesText(buffer_size)}/${_bytesText(copy_size)}`)
				.debug(`>> Copy "${copy_from}" => "${copy_to}"`);
				const from_info: IPathInfo|undefined = _pathinfo(copy_from);
				if (!from_info){
					logger.error(`Failed to get copy from path info! (${copy_from})`);
					return;
				}
				if (from_info.type === 1){
					await _copyFile(copy_from, copy_to, true, (copy_percent, copied_size, total_size) => {
						buffer_size += copied_size;
						if (!(Math.floor(copy_percent) % 5)){
							const percent = (((count/len) + (buffer_size/copy_size))/2 * 100);
							const label = `Coping ${count}/${len} - ${_bytesText(buffer_size)}/${_bytesText(copy_size)}`;
							logger.set(percent, label);
							if (count + 1 === len) logger.debug(`-- "${copy_from}" => "${copy_to}" ${copy_percent}% - ${copied_size}/${total_size}`);
							else logger.print();
						}
					})
					.catch(err => {
						logger.set(undefined, undefined, 'warn').warn(err);
					});
				}
				else _mkdir(copy_to);
			});
		}
		catch (e: any){
			throw e;
		}
	})()
	.catch((e: any) => {
		Term.error(`[E] Backup copy failure!`, e);
	});
};