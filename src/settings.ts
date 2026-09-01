import { App, PluginSettingTab, Setting } from 'obsidian';
import OrphanCleanerPlugin from './main';

export interface OrphanCleanerSettings {
	fileExtensions: string;
}

export const DEFAULT_SETTINGS: OrphanCleanerSettings = {
	fileExtensions: 'md png jpeg pdf',
};

export class OrphanCleanerSettingsTab extends PluginSettingTab {
	plugin: OrphanCleanerPlugin;

	constructor(app: App, plugin: OrphanCleanerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('File Extensions')
			.setDesc("The plugin will search only for these file extensions.\n" + 
				"Enter extension names seperated by a single space and without dots"
			)
			.addText((text) =>
				text
					.setPlaceholder('md png jpeg pdf')
					.setValue(this.plugin.settings.fileExtensions)
					.onChange(async (value) => {
						this.plugin.settings.fileExtensions = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
