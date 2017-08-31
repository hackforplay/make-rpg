'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const unorm = require('unorm');
const promisify = require('es6-promisify');

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const toPOSIX = str => (path.sep !== '/' ? str.split(path.sep).join('/') : str);

class MountFile {
	constructor(mountName, mountDir, timestamp) {
		// Copy props
		this.mountName = mountName;
		this.mountDir = mountDir;
		this.timestamp = timestamp;
	}

	get serialized() {
		if (!this._serialized) {
			// Serialize
			this._serialized = this.serialize();
		}
		return this._serialized;
	}

	async serialize() {
		// Convert unicode
		const mountName = unorm.nfc(this.mountName);
		const absolutePath = path.resolve(this.mountDir, mountName);
		const composed = await readFile(absolutePath, 'base64');

		return {
			name: toPOSIX(mountName),
			type: mime.lookup(absolutePath),
			lastModified: Date.parse(this.timestamp),
			composed,

			options: {
				isTrashed: false
			},
			credits: []
		};
	}
}

module.exports = class FeelesWebpackPlugin {
	constructor(params) {
		params = Object.assign({
				paths: ['mount'],
				output: 'index.json',
				ignore: /[]/,
				debug: false
			},
			params
		);
		this.output = params.output;
		this.ignore = params.ignore;
		this.debug = params.debug;

		this.cache = new Map(); // { [mountName]: [<MountFile>] }
		this.mountDirs = params.paths.map(s => path.resolve(s));
		this.priorityOrders = new Map(); // { [mountDir]: [order] }
		for (let mountDir of this.mountDirs) {
			this.priorityOrders.set(mountDir, this.priorityOrders.size);
		}
	}

	apply(compiler) {
		// コンパイル開始
		compiler.plugin('compilation', (compilation, params) => {
			const pushDirFiles = dirPath => {
				for (const name of fs.readdirSync(dirPath)) {
					const targetPath = path.resolve(dirPath, name);
					const stats = fs.statSync(targetPath);
					if (stats.isFile() && !this.ignore.test(targetPath)) {
						// 次の emit の compilation.fileDependencies に含める
						params.compilationDependencies.push(targetPath);
					}
					if (stats.isDirectory()) {
						pushDirFiles(targetPath);
					}
				}
			};
			// すべての mountDir を再帰的に探索する
			for (const mountDir of this.mountDirs) {
				pushDirFiles(mountDir);
			}
		});

		compiler.plugin('emit', async(compilation, callback) => {
			// compilation.fileDependencies をもとにプロジェクト全体をシリアライズ

			// { [mountName]: [mountDir] }
			const mountNameDir = new Map();

			for (const absolutePath of compilation.fileDependencies) {
				if (this.ignore.test(absolutePath)) continue; // ignore

				// mountName を切り出す
				for (const mountDir of this.mountDirs) {
					if (absolutePath.startsWith(mountDir + path.sep)) {
						const mountName = path.relative(mountDir, absolutePath);
						// すでにある候補もふくめて最も優先順位の高いパスを mountNameDir に set
						const nextMountDir = this.maxPriority(
							mountDir,
							mountNameDir.get(mountName)
						);
						mountNameDir.set(mountName, nextMountDir);
					}
				}
			}

			const entry = []; // プロジェクトのファイル全体
			let changed = false; // 変更があったかどうか

			for (const [mountName, mountDir] of mountNameDir.entries()) {
				// webpack が提供する timestamp を取得
				const absolutePath = path.resolve(mountDir, mountName);
				const timestamp =
					compilation.fileTimestamps[absolutePath] ||
					Date.parse((await stat(absolutePath)).mtime);

				// キャッシュと同一のものか調べる
				if (this.cache.has(mountName)) {
					const p = this.cache.get(mountName);
					if (mountDir === p.mountDir && timestamp <= p.timestamp) {
						// 前回のビルドと同じ. そのまま
						entry.push(p.serialized);
						continue;
					} else {
						// 場所かタイムスタンプが異なるのでキャッシュを削除
						this.cache.delete(mountName);
						if (this.debug) {
							console.log('📦 Feeles/mod:', mountName, mountDir);
						}
					}
				}
				// キャッシュとは異なるので新しく作成
				const add = new MountFile(mountName, mountDir, timestamp);
				entry.push(add.serialized);
				this.cache.set(mountName, add);
				// フラグを立てる
				changed = true;
				if (this.debug) {
					console.log('📦 Feeles/add:', mountName, mountDir);
				}
			}

			if (changed) {
				const files = await Promise.all(entry);
				console.log(
					`📦 Feeles:${entry.length} files mounted\tin ${this.mountDirs.join()}`
				);
				const json = JSON.stringify(files);
				compilation.assets[this.output] = {
					source() {
						return json;
					},
					size() {
						return json.length;
					}
				};
			}
			callback();
		});

		compiler.plugin('after-emit', (compilation, callback) => {
			// 次の emit の compilation.fileDependencies に含める
			for (let mountDir of this.mountDirs) {
				compilation.contextDependencies.push(mountDir);
			}
			callback();
		});
	}

	maxPriority(a, b) {
		if (!this.priorityOrders.has(a)) return b;
		if (!this.priorityOrders.has(b)) return a;

		return this.priorityOrders.get(a) < this.priorityOrders.get(b) ? a : b;
	}
};
