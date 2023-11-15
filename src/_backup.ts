import { _parseIgnore } from './_parse_ignore';
import { ProgTerm, _dirPath, _normSep, _print } from './__utils';
import { IPathInfo, _exists,  _hashFile, _hashes, _renamePath, _mkdir, _pathinfo, _processArgs, _copyFile } from './xfs';
import { Term, _asyncAll, _asyncQueue, _basename, _batchValues, _bytesVal, _errorText, _filepath, _jsonStringify, _str } from './xutils';

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
			Term.info('>> running backup...');
			
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

			//-- parse source paths
			Term.debug(`>> parsing backup source directory contents... (${source_dir})`);
			const paths: string[] = await _parseIgnore(source_dir, false, true, '/');

			//-- calculate items
			let count: number = 0;
			let copy_size: number = 0;
			let copy_files: number = 0;
			let unchanged_count: number = 0;
			const logger = new ProgTerm();
			const entries: [string,string][] = [];
			const hash_cache: {[key: string]: string} = {};
			const renamed_dirs: Set<string> = new Set();
			logger.info(`>> Calculating ${paths.length} found items...`);
			await _asyncQueue(paths, 20, async (path, _, len) => {
				
				//-- queue progress
				count ++;
				logger.set(count/len * 100, `Calculating... ${count}/${len}`).print();
				
				//-- backup source
				const from: string = source_dir + '/' + path;
				const from_path: string = from.substring(0, source_dir.length);
				const from_info: IPathInfo|undefined = _pathinfo(from);
				if (!from_info){
					logger.error(`-- failed to get backup source path info! (${from})`);
					return;
				}
				if (![1, 2].includes(from_info.type)){
					logger.warn(`-- unsupported backup source type! (${path}) ~ ${from_info.type}`);
					return;
				}

				//-- backup destination > replace renamed destination directory path
				let to: string = dest_dir + '/' + path;
				for (const dir of renamed_dirs){
					if (to.indexOf(dir) === 0){
						tmp = to;
						to = dir + to.substring(dir.length);
						logger.warn(`-- using renamed backup destination directory path (${dir}) "${tmp}" => "${to}"`);
					}
				}
				let to_path: string = to.substring(0, dest_dir.length);
				let to_info: IPathInfo|undefined = _pathinfo(to);

				//-- check source-destination type mismatch > rename
				if (to_info && from_info.type !== to_info.type){
					tmp = _renamePath(to);
					logger.warn(`-- renamed backup destination ${from_info.type === 2 ? 'directory' : 'file'} due to existing type mismatch (${to_info.type}) "${to}" => "${tmp}"`);
					to = tmp;
					to_info = undefined;
					to_path = to.substring(0, dest_dir.length);
					if (from_info.type === 2) renamed_dirs.add(to);
				}

				//-- handle existing backup destination
				if (to_info){
					
					//-- compare existing file
					if (from_info.type === 1){

						//-- calc sha256 file hashes simultaneously
						let from_hash: string = '', to_hash: string = '', hash_errors: string[] = [];
						await _asyncAll([from, to], async (file, i) => {
							const file_type: string = i ? 'existing' : 'source';
							// const file_path: string = i ? to_path : from_path;
							// logger.debug(`-- calculating ${file_type} file sha256 hash... (${file_path})`);
							const hash: string = await _hashFile(file, 'sha256').catch(() => '');
							if (!hash){
								hash_errors.push(`Failed to calculate ${file_type} file sha256 hash! (${file})`);
								return;
							}
							hash_cache[file] = hash;
							if (i) to_hash = hash;
							else from_hash = hash;
						});

						//-- skip on hash calc errors
						if (hash_errors.length){
							logger.error('-- skipped failure: ' + hash_errors.join('; '));
							return;
						}

						//-- compare file hashes > skip unchanged
						const unchanged: boolean = to_hash === from_hash;
						if (unchanged){
							unchanged_count ++;
							return;
						}
						logger.log(`-- added changed file: "${path}" ~ "${from_hash}" => "${to_hash}"`);
					}

					//-- skip existing directory
					else {
						unchanged_count ++;
						// logger.debug(`-- skipped existing directory. (${path})`);
						return;
					}
				}
				else logger.debug(`-- added new ${from_info.type === 1 ? 'file' : 'directory'}: "${path}"`);
				if (from_info.type === 1){
					copy_size += from_info.size;
					copy_files ++
				}
				entries.push([from, to]);
			});
			if (unchanged_count) logger.debug(`-- ignoring ${unchanged_count} unchanged items.`);

			//-- copy entries
			count = 0;
			let buffer_size: number = 0;
			let copy_failures: number = 0;
			logger.set(0, 'Copying...').debug(' ');
			logger.info(`>> Copying backup ${entries.length} entries...` + (copy_files ? ` (${copy_files} files ~ ${_bytesVal(copy_size)})` : ''));
			await _asyncQueue(entries, 20, async (entry, _, len) => {
				
				//fn => helper > queue progress
				const _queue_progress = (): void => void logger.set(((count/len) + (buffer_size/copy_size))/2 * 100, `Copying... ${count}/${len}` + (copy_size ? ` ${_bytesVal(buffer_size)}/${_bytesVal(copy_size)}` : '')).print();
				
				//-- update queue progress
				count ++;
				_queue_progress();
				
				//-- copy entry paths
				const [copy_from, copy_to] = entry;
				const from_path = copy_from.substring(0, source_dir.length);
				const to_path = copy_to.substring(0, dest_dir.length);
				
				//-- copy source info
				const from_info: IPathInfo|undefined = _pathinfo(copy_from);
				if (!from_info){
					logger.error(`Failed to get copy from path info! (${copy_from})`);
					return;
				}

				//-- start copy
				const debug_path = from_path === to_path ? `"${from_path}"` : `"${from_path}" => "${to_path}"`;
				logger.debug(`-- copy: ${debug_path}`);

				//-- copy file
				if (from_info.type === 1){
					let copied_bytes: number = 0;
					await _copyFile(copy_from, copy_to, true, (copy_percent, copied_size, total_size) => {
						buffer_size += copied_size;
						copied_bytes += copied_size;
						
						//-- update progress in percent 5ths
						if (!(Math.floor(copy_percent) % 5)){
							_queue_progress();

							//-- debug last item in percent 10ths
							if ((count + 1 === len && !(Math.floor(copy_percent) % 10)) || copy_percent >= 100){
								logger[copy_percent >= 100 ? 'success' : 'debug'](`-- ${debug_path} ${copy_percent}% - ${copied_size}/${total_size}`);
							}
						}
					})
					.catch(err => {
						copy_failures ++;
						buffer_size += from_info.size - copied_bytes;
						logger.set(undefined, undefined, 'warn').warn(err); //-- copy failure
					});
				}

				//-- copy directory
				else _mkdir(copy_to);
			});

			//-- complete
			logger.set(100, '', copy_failures ? 'warn' : 'success');
			logger[copy_failures ? 'error': 'success'](`-- backup copy complete! ${entries.length} items` + (copy_failures ? `, ${copy_failures} failures` : ''));
		}
		catch (e: any){
			throw e;
		}
	})()
	.catch((e: any) => {
		Term.error(`[E] Backup copy failure!`, e);
	});
};