import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { FileBrowser, FileRenderers, FolderRenderers, Groupers, Icons } from '../lib';
import { subDays, subHours, subMonths } from 'date-fns';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof FileBrowser> = {
	title: 'Groupers and Renderers',
	component: FileBrowser,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {
		backgroundColor: { control: 'color' },
	},
	// Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
	args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof FileBrowser>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const GroupersAndRendererStories: Story = {
	args: {
		icons: Icons.FontAwesome(4),
		files: [
			{
				key: 'cat.js',
				modified: subHours(new Date(), 1).getTime(),
				size: 1.5 * 1024 * 1024,
			},
			{
				key: 'kitten.png',
					modified: subDays(new Date(), 3).getTime(),
				size: 545 * 1024,
			},
			{
				key: 'elephant.png',
					modified: subDays(new Date(), 3).getTime(),
				size: 52 * 1024,
			},
			{
				key: 'dog.png',
					modified: subHours(new Date(), 1).getTime(),
				size: 1.5 * 1024 * 1024,
			},
			{
				key: 'turtle.png',
					modified: subMonths(new Date(), 3).getTime(),
				size: 545 * 1024,
			},
			{
				key: 'gecko.png',
					modified: subDays(new Date(), 2).getTime(),
				size: 52 * 1024,
			},
			{
				key: 'centipede.png',
					modified: subHours(new Date(), 0.5).getTime(),
				size: 1.5 * 1024 * 1024,
			},
			{
				key: 'possum.png',
					modified: subDays(new Date(), 32).getTime(),
				size: 545 * 1024,
			},
		],
		renderStyle: "list",
		headerRenderer: null,
		group: Groupers.GroupByModifiedRelative,
		fileRenderer: FileRenderers.ListThumbnailFile,
		folderRenderer: FolderRenderers.ListThumbnailFolder,
	},
}
