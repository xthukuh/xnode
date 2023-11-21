import { _parseIgnore } from './_parse_ignore';
import { ProgTerm, _dirPath, _normSep, _print } from './__utils';
import {
	IPathInfo,
	_exists,
	_hashFile,
	_hashes,
	_renamePath,
	_mkdir,
	_pathinfo,
	_processArgs,
	_copyFile,
} from './xfs';
import {
	Term,
	_asyncAll,
	_asyncQueue,
	_basename,
	_batchValues,
	_bytesVal,
	_debouced,
	_duration,
	_errorText,
	_filepath,
	_jsonStringify,
	_posInt,
	_round,
	_str,
	bool,
} from './xutils';


// Copy tasks
const _copy_tasks = async (from_dir: string, to_dir: string): Promise<any> => {
	const logger = new ProgTerm();
	logger.set(0, 'Parsing...').debug('>> Reading source "${from_dir}"...');
};

// Run backup
export const _run_backup = async (): Promise<any> => {
	return (async (): Promise<any> => {
		try {
			
			//-- parse args
			const args = _processArgs();
			const source: string = _str(args['--backup'], true);
			const destination: string = _str(args['--to'], true);
			
			//-- backup buffer
			interface IBakItem {
				path: string;
				name: string;
				type: 1|2;
				size: number;
				bytes: number;
				error: string;
				failed: boolean;
				skipped: boolean;
				started: boolean;
				completed: boolean;
			};
			const buffer: {[path: string]: IBakItem} = {};
			
			//-- backup progress
			let tmp: any;
			let task_label: string = '';
			let task_count: number = 0;
			let task_total: number = 0;
			let last_log: boolean = false;
			let prev_log: string = '';
			let time_start: number = 0;
			const logger = new ProgTerm();

			//fn => helper > update progress
			const _update = (log: string = ''): void => {
				let value: number = task_count;
				let total: number = task_total;
				const items: IBakItem[] = Object.values(buffer);
				const copy_total: number = items.length;
				total += copy_total;
				let queue_size: number = 0;
				let copy_count: number = 0;
				let done_count: number = 0;
				let skip_count: number = 0;
				let fail_count: number = 0;
				let buffer_size: number = 0;
				let buffer_size_total: number = 0;
				let last_item: IBakItem|undefined = undefined;
				for (const item of items){
					const item_done: boolean = item.skipped || item.completed || item.failed;
					if (item_done){
						value ++;
						copy_count ++;
					}
					else if (item.started){
						queue_size ++;
						last_item = queue_size === 1 ? item : undefined;
					}
					if (item.skipped) skip_count ++;
					else if (item.failed) fail_count ++;
					else if (item.completed) done_count ++;
					if (!item.failed && !item.skipped && item.size){
						const copied_bytes: number = item.completed ? item.size : item.bytes;
						buffer_size += copied_bytes;
						buffer_size_total += item.size;
						value += copied_bytes;
						total += item.size;
					}
				}
				const percent: number = (value/total * 100);
				let label: string = task_label;
				const pending: boolean = task_count < task_total;
				if (pending) label += (label ? ' ' : '') + '[' + task_count + '/' + task_total + ']';
				if (copy_total){
					label += pending ? ' | ' : '';
					label += `copy ${copy_count}/${copy_total}`;
					if (copy_count) label += ' ' + _round(copy_count/copy_total, 2) + '%';
					if (buffer_size_total){
						label += ' ~ ' + _bytesVal(buffer_size) + '/' + _bytesVal(buffer_size_total);
						if (buffer_size) label += ' ' + _round(buffer_size/buffer_size_total, 2) + '%';
					}
					if (queue_size || skip_count || fail_count || done_count){
						const copy_extras: string[] = [];
						if (queue_size) copy_extras.push('queued:' + queue_size);
						if (skip_count) copy_extras.push('unchanged:' + skip_count);
						if (done_count) copy_extras.push('copied:' + done_count);
						if (fail_count) copy_extras.push('failed:' + fail_count);
						// if (speed_text) copy_extras.push(speed_text);
						label += ' (' + copy_extras.join(', ') + ')';
					}
					const now: number = Date.now();
					if (!time_start) time_start = now;
					const elapsed_ms: number = now - time_start;
					const pending_ms: number = elapsed_ms/percent * 100;
					const eta_ms: number = pending_ms - elapsed_ms;
					const eta_text: string = 'eta ' + _duration(eta_ms) + ' (' + eta_ms + ')';
					label += '\n-- ' + eta_text;
				}
				const format: string|string[] = fail_count ? 'warn' : 'dump';
				let print: boolean = true;
				logger.set(percent, label, format);
				if (log && log !== prev_log){
					prev_log = log;
					logger.debug(log);
					print = false;
				}
				if (queue_size){
					if (last_item && !last_log){
						last_log = true;
						let last_debug: string = last_item.path.indexOf(last_item.name) > -1 ? '"' + last_item.path + '"' : '"' + last_item.path + '" => "' + last_item.name + '"';
						last_debug += ' (' + _bytesVal(last_item.size) + ')';
						logger.debug(`-- copying ${last_debug}...`);
						print = false;
					}
				}
				else {
					logger.mode = -1;
					print = false;
					logger.debug(' ');
					if (fail_count){
						for (const item of items){
							if (item.failed && item.error){
								let error: string = '[E] ' + (item.path.indexOf(item.name) > -1 ? '"' + item.path + '"' : '"' + item.path + '" => "' + item.name + '"');
								error += ' ~ ' + item.error;
								logger.warn(error);
							}
						}
					}
					logger.success('<< backup complete [' + _round(percent, 2) + '%] ' + label);
				}
				if (print) logger.print();
			};

			//fn => helper > handle error
			const _error = (error: string): void => {
				logger.mode = -1;
				logger.error(error);
			};

			//-- backup tasks
			task_total = 4;
			task_label = 'Backup';

			//-- [1] verify source
			task_count ++;
			_update(`Verify source directory... "${source}"`);
			if (!(tmp = _dirPath(source, true))) return _error('The backup source directory path is invalid!');
			const from_root: string = _normSep(tmp);

			//-- [2] verify destination
			task_count ++;
			_update(`Verify destination directory... "${destination}"`);
			if (!(tmp = _filepath(destination).toString())) return _error('The backup destination directory path is invalid!');
			const destination_info: IPathInfo|undefined = _pathinfo(tmp, 2);
			if (!destination_info){
				_update(`[+] creating destination directory... "${tmp}"`);
				if (!(tmp = _mkdir(tmp))) return _error(`Failed to create backup destination directory.`);
			}
			else {
				if (!destination_info.isDirectory) return _error('Invalid backup destination directory path is not a folder.');
				tmp = destination_info.target;
			}
			const to_root: string = _normSep(tmp);

			//-- [1] parse source
			task_count ++;
			task_label = 'Loading';
			_update('Parsing source entries...');
			const paths: string[] = await _parseIgnore(from_root, false, true, '/');
			for (const path of paths){
				const path_info: IPathInfo|undefined = _pathinfo(from_root + '/' + path);
				if (!path_info) continue;
				const type: 1|2 = path_info.type as any;
				if (![1, 2].includes(type)) continue;
				const name: string = _basename(path_info.path_full).toString();
				const size: number = type === 1 ? path_info.size : 0;
				const item: IBakItem = {
					path,
					name,
					type,
					size,
					bytes: 0,
					error: '',
					failed: false,
					skipped: false,
					started: false,
					completed: false,
				};
				buffer[path] = item;
			}
			
			//TODO: ... backup buffer copy
			logger.mode = -1;
			logger.print();
			Term.debug('<< backup buffer', buffer);
			// time_start = Date.now();
			// const _do_update = _debouced(() => _update(), 200, 500, true);

			
			//-------------------
			// //-- ready
			// Term.debug(`<< ready - backup source       :  "${source_dir}"`);
			// Term.debug(`<< ready - backup destination  :  "${dest_dir}"`);
			// // return Term.warn('HALT DEBUG!');

			// //-- parse source paths
			// Term.debug(`>> parsing backup source directory contents... (${source_dir})`);
			// const paths: string[] = await _parseIgnore(source_dir, false, true, '/');

			// //-- calculate items
			// let count: number = 0;
			// let copy_files: number = 0;
			// let unchanged_count: number = 0;
			// const logger = new ProgTerm();
			// const entries: [string,string][] = [];
			// const hash_cache: {[key: string]: string} = {};
			// const renamed_dirs: Set<string> = new Set();
			// logger.info(`>> Calculating ${paths.length} found items...`);
			// await _asyncQueue(paths, 20, async (path, _, len) => {
				
			// 	//-- queue progress
			// 	count ++;
			// 	logger.set(count/len * 100, `Calculating... ${count}/${len}`).print();
				
			// 	//-- backup source
			// 	const from: string = source_dir + '/' + path;
			// 	const from_path: string = from.substring(0, source_dir.length);
			// 	const from_info: IPathInfo|undefined = _pathinfo(from);
			// 	if (!from_info){
			// 		logger.error(`-- failed to get backup source path info! (${from})`);
			// 		return;
			// 	}
			// 	if (![1, 2].includes(from_info.type)){
			// 		logger.warn(`-- unsupported backup source type! (${path}) ~ ${from_info.type}`);
			// 		return;
			// 	}

			// 	//-- backup destination > replace renamed destination directory path
			// 	let to: string = dest_dir + '/' + path;
			// 	for (const dir of renamed_dirs){
			// 		if (to.indexOf(dir) === 0){
			// 			tmp = to;
			// 			to = dir + to.substring(dir.length);
			// 			logger.warn(`-- using renamed backup destination directory path (${dir}) "${tmp}" => "${to}"`);
			// 		}
			// 	}
			// 	let to_path: string = to.substring(0, dest_dir.length);
			// 	let to_info: IPathInfo|undefined = _pathinfo(to);

			// 	//-- check source-destination type mismatch > rename
			// 	if (to_info && from_info.type !== to_info.type){
			// 		tmp = _renamePath(to);
			// 		logger.warn(`-- renamed backup destination ${from_info.type === 2 ? 'directory' : 'file'} due to existing type mismatch (${to_info.type}) "${to}" => "${tmp}"`);
			// 		to = tmp;
			// 		to_info = undefined;
			// 		to_path = to.substring(0, dest_dir.length);
			// 		if (from_info.type === 2) renamed_dirs.add(to);
			// 	}

			// 	//-- handle existing backup destination
			// 	if (to_info){
					
			// 		//-- compare existing file
			// 		if (from_info.type === 1){

			// 			//-- calc sha256 file hashes simultaneously
			// 			let from_hash: string = '', to_hash: string = '', hash_errors: string[] = [];
			// 			await _asyncAll([from, to], async (file, i) => {
			// 				const file_type: string = i ? 'existing' : 'source';
			// 				// const file_path: string = i ? to_path : from_path;
			// 				// logger.debug(`-- calculating ${file_type} file sha256 hash... (${file_path})`);
			// 				const hash: string = await _hashFile(file, 'sha256').catch(() => '');
			// 				if (!hash){
			// 					hash_errors.push(`Failed to calculate ${file_type} file sha256 hash! (${file})`);
			// 					return;
			// 				}
			// 				hash_cache[file] = hash;
			// 				if (i) to_hash = hash;
			// 				else from_hash = hash;
			// 			});

			// 			//-- skip on hash calc errors
			// 			if (hash_errors.length){
			// 				logger.error('-- skipped failure: ' + hash_errors.join('; '));
			// 				return;
			// 			}

			// 			//-- compare file hashes > skip unchanged
			// 			const unchanged: boolean = to_hash === from_hash;
			// 			if (unchanged){
			// 				unchanged_count ++;
			// 				return;
			// 			}
			// 			logger.log(`-- added changed file: "${path}" ~ "${from_hash}" => "${to_hash}"`);
			// 		}

			// 		//-- skip existing directory
			// 		else {
			// 			unchanged_count ++;
			// 			// logger.debug(`-- skipped existing directory. (${path})`);
			// 			return;
			// 		}
			// 	}
			// 	else logger.debug(`-- added new ${from_info.type === 1 ? 'file' : 'directory'}: "${path}"`);
			// 	entries.push([from, to]);
			// });
			// if (unchanged_count) logger.debug(`-- ignoring ${unchanged_count} unchanged items.`);

			// //-- copy entries
			// count = 0;
			// let copy_size: number = 0;
			// let buffer_size: number = 0;
			// let copy_failures: number = 0;
			// logger.set(0, 'Copying...').debug(' ');
			// logger.info(`>> Copying backup ${entries.length} entries...`);
			// await _asyncQueue(entries, 20, async (entry, _, len) => {
				
			// 	//fn => helper > queue progress
			// 	const _queue_progress = (): void => {
			// 		const percent = (count/len * 20) + (buffer_size/copy_size * 80);
			// 		// const percent = (copy_size ? buffer_size/copy_size : count/len) * 100;
			// 		logger.set(percent, `Copying... ${count}/${len}` + (copy_size ? ` ${_bytesVal(buffer_size)}/${_bytesVal(copy_size)}` : '')).print();
			// 	}
				
			// 	//-- update queue progress
			// 	count ++;
			// 	_queue_progress();
				
			// 	//-- copy entry paths
			// 	const [copy_from, copy_to] = entry;
			// 	const from_path = copy_from.substring(0, source_dir.length);
			// 	const to_path = copy_to.substring(0, dest_dir.length);
				
			// 	//-- copy source info
			// 	const from_info: IPathInfo|undefined = _pathinfo(copy_from);
			// 	if (!from_info){
			// 		logger.error(`Failed to get copy from path info! (${copy_from})`);
			// 		return;
			// 	}

			// 	//-- start copy
			// 	const debug_path = from_path === to_path ? `"${from_path}"` : `"${from_path}" => "${to_path}"`;
			// 	logger.debug(`-- copy: ${debug_path}`);

			// 	//-- copy file
			// 	if (from_info.type === 1){
			// 		let copied_bytes: number = 0;
			// 		await _copyFile(copy_from, copy_to, true, (copy_percent, copied_size, total_size) => {
			// 			buffer_size += copied_size;
			// 			copied_bytes += copied_size;
						
			// 			//-- update progress in percent 5ths
			// 			if (!(Math.floor(copy_percent) % 5)){
			// 				_queue_progress();

			// 				//-- debug last item in percent 10ths
			// 				if ((count + 1 === len && !(Math.floor(copy_percent) % 10)) || copy_percent >= 100){
			// 					logger[copy_percent >= 100 ? 'success' : 'debug'](`-- ${debug_path} ${copy_percent}% - ${copied_size}/${total_size}`);
			// 				}
			// 			}
			// 		})
			// 		.catch(err => {
			// 			copy_failures ++;
			// 			buffer_size += from_info.size - copied_bytes;
			// 			logger.set(undefined, undefined, 'warn').warn(err); //-- copy failure
			// 		});
			// 	}

			// 	//-- copy directory
			// 	else {
			// 		const dir = _mkdir(copy_to);
			// 		if (dir) logger.success(`-- ${debug_path} directory created.`)
			// 		else logger.warn(`-- ${debug_path} create directory failed.`);
			// 	}
			// });

			// //-- complete
			// logger.set(100, '', copy_failures ? 'warn' : 'success');
			// logger[copy_failures ? 'error': 'success'](`-- backup copy complete! ${entries.length} items` + (copy_failures ? `, ${copy_failures} failures` : ''));
		}
		catch (e: any){
			throw e;
		}
	})()
	.catch((e: any) => {
		Term.error(`[E] Backup copy failure!`, e);
	});
};