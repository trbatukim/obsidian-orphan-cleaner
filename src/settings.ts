import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import OrphanCleanerPlugin from './main';

export interface OrphanCleanerSettings {
	fileExtensions: string;
	excludedPaths: string;
	excludeTags: boolean;
}

export const DEFAULT_SETTINGS: OrphanCleanerSettings = {
	fileExtensions: 'md png jpeg pdf',
	excludedPaths: '',
	excludeTags: true,
};

export class OrphanCleanerSettingsTab extends PluginSettingTab {
	plugin: OrphanCleanerPlugin;

	constructor(app: App, plugin: OrphanCleanerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'File extensions',
				desc:
					"The plugin will search only for these file extensions.\n" +
					"Enter extension names separated by a single space and without dots",
				control: {
					type: 'text',
					key: 'fileExtensions',
					placeholder: 'md png jpeg pdf',
					defaultValue: DEFAULT_SETTINGS.fileExtensions,
				},
			},
			{
				name: 'Excluded paths',
				desc:
					'Files inside these folders, or matching these exact file paths, will never be treated as orphans. ' +
					'Enter one folder or file path per line, relative to the vault root.',
				control: {
					type: 'textarea',
					key: 'excludedPaths',
					placeholder: 'Templates\nAttachments/Archive',
					rows: 4,
					defaultValue: DEFAULT_SETTINGS.excludedPaths,
				},
			},
			{
				name: 'Exclude files with tags',
				desc: "Files that have any tags will not be considered orphans even if they have no connections.",
				control: {
					type: 'toggle',
					key: 'excludeTags',
					defaultValue: DEFAULT_SETTINGS.excludeTags,
				},
			},
		];
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('File extensions')
			.setDesc(
				"The plugin will search only for these file extensions.\n" + 
				"Enter extension names separated by a single space and without dots"
			).addText((text) =>
				text
					.setPlaceholder('md png jpeg pdf')
					.setValue(this.plugin.settings.fileExtensions)
					.onChange(async (value) => {
						this.plugin.settings.fileExtensions = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Excluded paths')
			.setDesc(
				'Files inside these folders, or matching these exact file paths, will never be treated as orphans. ' +
				'Enter one folder or file path per line, relative to the vault root.'
			)
			.addTextArea((text) => {
				text
					.setPlaceholder('Templates\nAttachments/Archive')
					.setValue(this.plugin.settings.excludedPaths)
					.onChange(async (value) => {
						this.plugin.settings.excludedPaths = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 4;
			});

		new Setting(containerEl)
			.setName('Exclude files with tags')
			.setDesc(
				"Files that have any tags will not be considered orphans even if they have no connections."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.excludeTags)
					.onChange(async (value) => {
						this.plugin.settings.excludeTags = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
