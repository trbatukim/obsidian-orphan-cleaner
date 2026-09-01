import {
	App,
	Modal,
	Notice,
	Plugin,
	TFile,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	OrphanCleanerSettings,
	OrphanCleanerSettingsTab,
} from './settings';


export default class OrphanCleanerPlugin extends Plugin {
	settings!: OrphanCleanerSettings;
	private metadataCacheResolved = false;

	async onload() {
		await this.loadSettings();

		this.registerEvent(
			this.app.metadataCache.on('resolved', () => {
				this.metadataCacheResolved = true;
			}),
		);

		this.app.workspace.onLayoutReady(() => {
			this.metadataCacheResolved = true;
		});

		this.addSettingTab(new OrphanCleanerSettingsTab(this.app, this));

		this.addRibbonIcon('trash', 'Clean orphan nodes', (_evt: MouseEvent) => {
			this.openOrphanConfirmation();
		});

		this.addCommand({
			id: 'clean-orphan-nodes',
			name: 'Clean orphan nodes',
			callback: () => {
				this.openOrphanConfirmation();
			},
		});
	}

	openOrphanConfirmation() {
		if (!this.metadataCacheResolved) {
			new Notice('Obsidian is still indexing your vault. Please try again in a moment.');
			return;
		}

		const orphans = this.findOrphans();

		if (orphans.length === 0) {
			new Notice('No orphan files found.');
			return;
		}

		new ConfirmDeleteModal(this.app, orphans, () => {
			void this.deleteOrphans(orphans);
		}).open();
	}

	async deleteOrphans(orphans: TFile[]) {
		let deleted: number = 0;
		let failed: number = 0;

		for (const file of orphans) {
			try {
				await this.app.fileManager.trashFile(file);
				deleted++;
			} catch {
				failed++;
			}
		}

		if (deleted !== 0) new Notice(`Deleted ${deleted} orphan file(s).`);
		if (failed !== 0) new Notice(`Failed to delete ${failed} orphan file(s).`);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<OrphanCleanerSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	findOrphans(): TFile[] {
		const files = this.app.vault.getFiles();
		const resolvedLinks = this.app.metadataCache.resolvedLinks;
		const orphans: TFile[] = [];

		const referencedPaths: Set<string> = new Set();
		for (const targets of Object.values(resolvedLinks)) {
			for (const targetPath of Object.keys(targets)) {
				referencedPaths.add(targetPath);
			}
		}

		const targetExtensions: string[] = this.settings.fileExtensions
			.toLowerCase().split(" ");

		const excludedPaths: string[] = this.settings.excludedPaths
			.split("\n")
			.map((path) => path.trim().replace(/\/+$/, ""))
			.filter((path) => path.length > 0);

		for (const file of files) {
			if (this.isExcluded(file.path, excludedPaths)) continue;
			if (!targetExtensions.includes(file.extension.toLowerCase())) continue;
			if (referencedPaths.has(file.path)) continue;

			orphans.push(file);
		}

		return orphans;
	}

	private isExcluded(filePath: string, excludedPaths: string[]): boolean {
		return excludedPaths.some(
			(excludedPath) => filePath === excludedPath || filePath.startsWith(excludedPath + "/"),
		);
	}
}

class ConfirmDeleteModal extends Modal {
	private files: TFile[];
	private onConfirm: () => void;

	constructor(app: App, files: TFile[], onConfirm: () => void) {
		super(app);
		this.files = files;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;

		this.setTitle(`Delete ${this.files.length} orphan file(s)?`);

		const list = contentEl.createEl('ul', { cls: 'orphan-cleaner-file-list' });
		for (const file of this.files) {
			list.createEl('li', { text: file.path });
		}

		contentEl.createEl('p', {
			text: this.describeTrashBehavior(),
			cls: 'mod-warning',
		});

		const buttonRow = contentEl.createDiv({ cls: 'modal-button-container' });

		buttonRow.createEl('button', { text: 'Cancel' }).addEventListener('click', () => {
			this.close();
		});

		const confirmButton = buttonRow.createEl('button', {
			text: 'Delete',
			cls: 'mod-warning',
		});
		confirmButton.addEventListener('click', () => {
			this.onConfirm();
			this.close();
		});
	}

	onClose() {
		this.contentEl.empty();
	}

	private describeTrashBehavior(): string {
		const trashOption: unknown = (this.app.vault as { getConfig?: (key: string) => unknown })
			.getConfig?.('trashOption');

		switch (trashOption) {
			case 'system':
				return 'This action cannot be undone from within Obsidian. Files will be moved to your system trash/recycle bin.';
			case 'local':
				return 'This action cannot be undone from within Obsidian. Files will be moved to this vault\'s .trash folder.';
			case 'none':
				return 'This action cannot be undone. Files will be permanently deleted (your vault is set to skip the trash).';
			default:
				return 'This action cannot be undone from within Obsidian. Files will be deleted according to your vault\'s trash setting (Settings → Files and links).';
		}
	}
}
