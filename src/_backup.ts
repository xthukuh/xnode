import { _parseIgnore } from './_parse_ignore';
import { ProgTerm, _dirPath, _normSep } from './__utils';
import {
	IPathInfo,
	_hashFile,
	_mkdir,
	_pathinfo,
	_processArgs,
	_copyFile,
} from './xfs';
import {
	_asyncAll,
	_asyncQueue,
	_bytesVal,
	_debouced,
	_duration,
	_errorText,
	_filepath,
	_round,
	_str,
} from './xutils';

/**
 * Backup copy directories
 * 
 * @param source - backup from directory
 * @param destination - backup to directory
 * @returns `Promise<void>`
 */
export const _backup_copy = async (source: string, destination: string): Promise<void> => {
	const logger = new ProgTerm();
	return (async (): Promise<void> => {
		try {
			
			//-- backup buffer
			interface IBakItem {
				path: string;
				name: string;
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
			let backup_done: boolean = false;

			//fn => helper > update progress
			const _update = (log: string = '', is_done: boolean = false): void => {
				if (backup_done) return;
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
					const copied_bytes: number = item_done ? item.size : item.bytes;
					buffer_size += copied_bytes;
					buffer_size_total += item.size;
				}
				value += buffer_size;
				total += buffer_size_total;
				const percent: number = (value/total * 100);
				const texts: string[] = [task_label];
				const pending: boolean = task_count < task_total;
				if (pending) texts.push('[' + task_count + '/' + task_total + ']');
				if (copy_total){
					if (pending) texts.push(' | ');
					texts.push(`Files ${copy_count !== copy_total ? copy_count + '/' + copy_total : copy_total}`);
					if (buffer_size_total) texts.push('~ ' + (buffer_size !== buffer_size_total ? _bytesVal(buffer_size) + '/' + _bytesVal(buffer_size_total) : _bytesVal(buffer_size_total)));
					const copy_extras: string[] = [];
					if (queue_size) copy_extras.push('queued:' + queue_size);
					if (skip_count) copy_extras.push('unchanged:' + skip_count);
					if (done_count) copy_extras.push('copied:' + done_count);
					if (fail_count) copy_extras.push('failed:' + fail_count);
					if (copy_extras.length) texts.push(' | ' + copy_extras.join(', '));
					const now: number = Date.now();
					if (!time_start) time_start = now;
					const elapsed_ms: number = now - time_start;
					const pending_ms: number = Math.round(elapsed_ms/percent * 100);
					const eta_ms: number = pending_ms - elapsed_ms;
					const eta_text: string = ' | eta ' + _duration(eta_ms);
					if (percent && percent < 100) texts.push(eta_text);
				}
				let print: boolean = true;
				const format: string|string[] = fail_count ? 'warn' : 'dump';
				const label: string = texts.join(' ').replace(/\n/g, '; ');
				logger.set(percent, label, format);
				if (log && log !== prev_log){
					prev_log = log;
					logger.debug(log);
					print = false;
				}
				if (queue_size){
					if (last_item && !last_log){
						last_log = true;
						if (percent <= 95){
							let last_debug: string = last_item.path.indexOf(last_item.name) > -1 ? '"' + last_item.path + '"' : '"' + last_item.path + '" => "' + last_item.name + '"';
							last_debug += ' (' + _bytesVal(last_item.size) + ')';
							logger.debug(`-- copying ${last_debug}...`);
							print = false;
						}
					}
				}
				if (is_done) {
					backup_done = true;
					logger.mode = 1;
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
					logger.success('Backup complete!');
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

			//-- [3] parse source
			task_count ++;
			task_label = 'Loading';
			_update('Parsing source files...');
			const paths: string[] = await _parseIgnore(from_root, false, true, '/');
			for (const path of paths){
				const path_info: IPathInfo|undefined = _pathinfo(from_root + '/' + path, 1); //lstatSync - detect links
				if (!path_info) continue; //-- skip > path does not exist
				if (path_info.type !== 1) continue; //-- skip > links and directories\
				const item: IBakItem = {
					path,
					name: path_info.basename,
					size: path_info.size,
					bytes: 0,
					error: '',
					failed: false,
					skipped: false,
					started: false,
					completed: false,
				};
				buffer[path] = item;
			}

			//-- [4] copy files
			task_count ++;
			task_label = 'Backup';
			time_start = Date.now();
			const queue_size: number = 30;
			const items: IBakItem[] = Object.values(buffer);
			_update(`Backup copy ${items.length + ' file' + (items.length > 1 ? 's' : '')}...\n[+] "${from_root}" => "${to_root}"`);
			const _do_update = _debouced((log: string = '', is_done: boolean = false): void => _update(log, is_done), 200, 400);
			await _asyncQueue(items, queue_size, async (item, i, len) => {
				item.started = true;
				const copy_from: string = from_root + '/' + item.path;
				const copy_to: string = to_root + '/' + item.path;
				const to_info: IPathInfo|undefined = _pathinfo(copy_to, 1); //lstatSync - detect links
				_do_update();
				
				//-- destination exists
				if (to_info){
					
					//-- type mismatch failure
					if (to_info.type !== 1){
						item.error = `Copy destination is not a file. ("${copy_to}" => ${to_info.type})`;
						item.failed = true;
						return;
					}

					//-- compare sha256 file hashes
					let from_hash: string = '', to_hash: string = '', hash_errors: string[] = [];
					await _asyncAll([copy_from, copy_to], async (file, i) => {
						const hash: string = await _hashFile(file, 'sha256').catch(() => '');
						if (!hash) return hash_errors.push(`Failed to calculate ${i ? 'destination' : 'source'} file sha256 hash! (${file})`);
						if (i) to_hash = hash;
						else from_hash = hash;
					});
					if (hash_errors.length){
						item.error = 'Compare sha256 file hashes failed! ' + hash_errors.join('; ');
						item.failed = true;
						return;
					}
					if (from_hash === to_hash){
						item.skipped = true;
						return;
					}
				}

				//fn => helper > copy update callback
				const _copy_update = _debouced((_, bytes) => {
					item.bytes = bytes;
					_do_update();
				}, 200, 500, true);

				//-- copy to destination
				await _copyFile(copy_from, copy_to, true, _copy_update)
				.then(() => {
					item.completed = true;
				})
				.catch(err => {
					item.error = 'Copy failure! ' + _errorText(err);
					item.failed = true;
					return Promise.reject(item.error);
				});
			})
			.then(() => {
				_update('', true);
			});
		}
		catch (e: any){
			throw e;
		}
	})()
	.catch((err: any) => {
		logger.mode = -1;
		logger.error('Backup copy failure! ' + _errorText(err));
	});
};

/**
 * Run backup
 * 
 * @returns `Promise<void>`
 */
export const _run_backup = async (): Promise<void> => {
	const args = _processArgs();
	const source: string = _str(args['--backup'], true);
	const destination: string = _str(args['--to'], true);
	return _backup_copy(source, destination);
};