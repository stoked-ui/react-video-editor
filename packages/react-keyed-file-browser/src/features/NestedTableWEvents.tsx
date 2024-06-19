import { subHours, subDays, subMonths } from "date-fns";
import { useState } from "react";
import { FileBrowser, IKeyedFile } from "../browser.tsx";
import { Icons } from "../lib.ts";

export default function NestedEditableDemo() {
	const [files, setFiles] = useState<IKeyedFile[]>([
		{
			key: 'photos/animals/cat in a hat.png',
			modified: subHours(new Date(), 1).getTime(),
			size: 1.5 * 1024 * 1024,
		},
		{
			key: 'photos/animals/kitten_ball.png',
			modified: subDays(new Date(), 3).getTime(),
			size: 545 * 1024,
		},
		{
			key: 'photos/animals/elephants.png',
			modified: subDays(new Date(), 3).getTime(),
			size: 52 * 1024,
		},
		{
			key: 'photos/funny fall.gif',
			modified: subMonths(new Date(), 2).getTime(),
			size: 13.2 * 1024 * 1024,
		},
		{
			key: 'photos/holiday.jpg',
			modified: subDays(new Date(), 25).getTime(),
			size: 85 * 1024,
		},
		{
			key: 'documents/letter chunks.doc',
			modified: subDays(new Date(), 15).getTime(),
			size: 480 * 1024,
		},
		{
			key: 'documents/export.pdf',
			modified: subDays(new Date(), 15).getTime(),
			size: 4.2 * 1024 * 1024,
		},
	]);

	const handleCreateFolder = (key: string) => {
		const newFiles = files.concat([{
			key: key,
		}])
		setFiles({ ...newFiles});
	}

	const handleCreateFiles = (files: IKeyedFile[], prefix: string) => {
		const newFiles = files.map((file) => {
			let newKey = prefix
			if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
				newKey += '/'
			}
			newKey += file['name'];
			return {
				key: newKey,
				size: file.size,
				modified: Date.now(),
			}
		})

		const uniqueNewFiles = []
		newFiles.map((newFile) => {
			let exists = false
			files.map((existingFile) => {
				if (existingFile.key === newFile.key) {
					exists = true
				}
			})
			if (!exists) {
				uniqueNewFiles.push(newFile)
			}
		});
		setFiles(newFiles);
	}

	const handleRenameFolder = (oldKey: string, newKey: string) => {
		const newFiles: IKeyedFile[] = []
		files.map((file) => {
			if (file.key.substr(0, oldKey.length) === oldKey) {
				newFiles.push({
					...file,
					key: file.key.replace(oldKey, newKey),
					modified: Date.now(),
				})
			} else {
				newFiles.push(file)
			}
		})
		setFiles(newFiles);
	}

	const handleRenameFile = (oldKey: string, newKey: string) => {
		const newFiles: IKeyedFile[] = []
		files.map((file) => {
			if (file.key === oldKey) {
				newFiles.push({
					...file,
					key: newKey,
					modified: Date.now(),
				})
			} else {
				newFiles.push(file)
			}
		})
		setFiles(newFiles);
	}

	const handleDeleteFolder = (folderKey: string) => {
		const newFiles: IKeyedFile[] = []
		files.map((file) => {
			if (file.key.substr(0, folderKey.length) !== folderKey) {
				newFiles.push(file)
			}
		})
		setFiles(newFiles);
	}

	const handleDeleteFile = (fileKey: string[]) => {
		const newFiles: IKeyedFile[] = files.filter((file) => fileKey.indexOf(file.key) === -1)
		setFiles(newFiles);
	}

	return (
		<FileBrowser
			files={files}
			icons={Icons.FontAwesome(4)}
			onCreateFolder={handleCreateFolder}
			onCreateFiles={handleCreateFiles}
			onMoveFolder={handleRenameFolder}
			onMoveFile={handleRenameFile}
			onRenameFolder={handleRenameFolder}
			onRenameFile={handleRenameFile}
			onDeleteFolder={handleDeleteFolder}
			onDeleteFile={handleDeleteFile}
		/>
	)
}
