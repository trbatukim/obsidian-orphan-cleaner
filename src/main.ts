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

	async onload() {
		console.log("Loading Orphan Node Cleaner...");

		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('trash', 'Clean Orphan Nodes', (_evt: MouseEvent) => {
			this.openOrphanConfirmation();
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'clean-orphan-nodes',
			name: 'Clean orphan nodes',
			callback: () => {
				this.openOrphanConfirmation();
			},
		});
	}

	openOrphanConfirmation() {
		const orphans = this.findOrphans();

		if (orphans.length === 0) {
			new Notice('No orphan files found.');
			return;
		}

		new ConfirmDeleteModal(this.app, orphans, async () => {
			for (const file of orphans) {
				await this.app.vault.trash(file, true);
			}
			new Notice(`Deleted ${orphans.length} orphan file(s).`);
		}).open();
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
		const nonOrphans: Set<string> = new Set(Object.keys(resolvedLinks));

		const referencedPaths: Set<string> = new Set();
		for (const targets of Object.values(resolvedLinks)) {
			for (const targetPath of Object.keys(targets)) {
				referencedPaths.add(targetPath);
			}
		}

		const targetExtensions: string[] = ["md", "png", "pdf", "jpeg"];

		for (const file of files) {
			if (!targetExtensions.includes(file.extension.toLowerCase())) {
				nonOrphans.add(file.path);
				continue;
			}
			
			if (referencedPaths.has(file.path)) nonOrphans.add(file.path);
			if (resolvedLinks[file.path]) nonOrphans.add(file.path);

			if (!nonOrphans.has(file.path)) orphans.push(file);
		}

		return orphans;
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

		contentEl.createEl('h2', { text: `Delete ${this.files.length} orphan file(s)?` });

		const list = contentEl.createEl('ul');
		for (const file of this.files) {
			list.createEl('li', { text: file.path });
		}

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
}
