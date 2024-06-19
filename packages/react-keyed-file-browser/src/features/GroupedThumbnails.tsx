import { FileBrowser, FileRenderers, FolderRenderers, Groupers, Icons } from '../lib'
import { subDays, subHours, subMonths } from "date-fns";

export const GroupedThumbnails = () => {
	return <FileBrowser
		icons={Icons.FontAwesome(4)}
		files={[
			{
				key: 'cat.png',
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
		]}
		renderStyle="list"
		nestChildren
		headerRenderer={null}
		group={Groupers.GroupByModifiedRelative}
		fileRenderer={FileRenderers.ListThumbnailFile}
		folderRenderer={FolderRenderers.ListThumbnailFolder}
	/>;
}
