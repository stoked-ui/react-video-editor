import React, { useState, useEffect } from "react";
import { KeyedHookProps, extensionMapping } from "../common";

export interface FileListApi {
	icons: { [key: string]: React.ReactNode };
	select: (
		fileKey: string,
		fileType: string,
		ctrlKey?: boolean,
		shiftKey?: boolean
	) => void;
	beginAction: (actionType: string, fileKey: string) => void;
	endAction: () => void;
	preview: (file: {
		url: string;
		name: string;
		key: string;
		extension: string;
	}) => void;
	createFiles?: (files: File[], path: string) => void;
	moveFile?: (oldKey: string, newKey: string) => void;
	moveFolder?: (oldKey: string, newKey: string) => void;
	renameFile?: (oldKey: string, newKey: string) => void;
	deleteFile?: (fileKeys: string[]) => void;
	actionTargets: string[];
	selection: string[];
	openFolder: (path: string) => void;
}


const useFile = (props: KeyedHookProps) => {
	const {
		file: {name, key},
		browserProps,
	} = props;

	const getName = () => {
		let currName = props.newKey || name || key;
		const slashIndex = currName?.lastIndexOf("/");
		if (slashIndex !== -1) {
			currName = currName.substr(slashIndex + 1);
		}
		return currName;
	};
	console.log('browserProps', browserProps);

	const [newName, setNewName] = useState(getName());

	useEffect(() => {
		setNewName(getName());
	}, [props.newKey, name, key]);

	const floatPrecision = (
		floatValue: number | string,
		precision: number
	): string => {
		let parsedValue = parseFloat(floatValue as string);
		if (isNaN(parsedValue)) {
			return parseFloat("0").toFixed(precision);
		} else {
			const power = Math.pow(10, precision);
			parsedValue = (Math.round(parsedValue * power) / power).toFixed(
				precision
			) as any;
			return parsedValue.toString();
		}
	};

	const fileSize = (size: number): string => {
		if (size > 1024) {
			const kbSize = size / 1024;
			if (kbSize > 1024) {
				const mbSize = kbSize / 1024;
				return `${floatPrecision(mbSize, 2)} MB`;
			}
			return `${Math.round(kbSize)} kB`;
		}
		return `${size} B`;
	};

	const getExtension = () => {
		const blobs = key.split(".");
		return blobs[blobs.length - 1]?.toLowerCase().trim() || "";
	};

	const getFileType = () => {
		return extensionMapping[getExtension()] || "File";
	};

	const selectFileNameFromRef = (element: HTMLInputElement | null) => {
		if (element) {
			const currentName = element.value;
			const pointIndex = currentName.lastIndexOf(".");
			element.setSelectionRange(0, pointIndex || currentName.length);
			element.focus();
		}
	};

	const handleFileClick = (
		event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>
	) => {
		event && event.preventDefault();
		console.log('handleFileClick browserProps', browserProps);
		browserProps.select(key, 'file', event?.ctrlKey || event?.metaKey, event?.shiftKey)

	};

	const handleItemClick = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => {
		event.stopPropagation();
		props.browserProps.select(
			key,
			"file",
			event.ctrlKey || event.metaKey,
			event.shiftKey
		);
	};

	const handleItemDoubleClick = (

		event: React.MouseEvent<HTMLElement, MouseEvent>
	) => {
		event.stopPropagation();
		handleFileClick();
	};

	const handleRenameClick = () => {
		if (!props.browserProps.renameFile) {
			return;
		}
		props.browserProps.beginAction("rename", key);
	};

	const handleNewNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newName = event.target.value;
		setNewName(newName);
	};

	const handleRenameSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
		if (event) {
			event.preventDefault();
		}
		if (!props.browserProps.renameFile) {
			return;
		}
		const trimmedName = newName.trim();
		if (trimmedName.length === 0) {
			// todo: move to props handler
			return;
		}
		const invalidChar = ["/", "\\"];
		if (invalidChar.some((char) => trimmedName.indexOf(char) !== -1)) return;
		// todo: move to props handler
		let newKey = trimmedName;
		const slashIndex = key.lastIndexOf("/");
		if (slashIndex !== -1) {
			newKey = `${key.substr(0, slashIndex)}/${trimmedName}`;
		}
		props.browserProps.renameFile(key, newKey);
	};

	const handleDeleteClick = () => {
		if (!props.browserProps.deleteFile) {
			return;
		}
		props.browserProps.beginAction("delete", key);
	};

	const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!props.browserProps.deleteFile) {
			return;
		}
		props.browserProps.deleteFile(props.browserProps.actionTargets);
	};

	const handleCancelEdit = () => {
		props.browserProps.endAction();
	};

	const connectDND = (render: React.ReactNode) => {
		const inAction = props.isDragging || props.action;
		if (
			typeof props.browserProps.moveFile === "function" &&
			!inAction &&
			!props.isRenaming
		) {
			//render = props.connectDragSource(render);
		}
		if (
			typeof props.browserProps.createFiles === "function" ||
			typeof props.browserProps.moveFile === "function" ||
			typeof props.browserProps.moveFolder === "function"
		) {
			//render = props.connectDropTarget(render);
		}
		return render;
	};
	console.log('handleItemDoubleClick', name, handleItemDoubleClick);

	return {
		newName,
		setNewName,
		getName,
		getExtension,
		getFileType,
		selectFileNameFromRef,
		handleFileClick,
		handleItemClick,
		handleItemDoubleClick,
		handleRenameClick,
		handleNewNameChange,
		handleRenameSubmit,
		handleDeleteClick,
		handleDeleteSubmit,
		handleCancelEdit,
		connectDND,
		floatPrecision,
		fileSize,
	};
};

const dragSource = {
	beginDrag(props: KeyedHookProps) {
		if (
			!props.browserProps.selection.length ||
			!props.browserProps.selection.includes(props.file.key)
		) {
			props.browserProps.select(props.file.key, "file");
		}
		return {
			key: props.file.key,
		};
	},

	endDrag(/*props: UseFileProps, monitor: any*/) {
		//moveFilesAndFolders(props, monitor);
	},
};

function dragCollect(connect: any, monitor: any) {
	return {
		connectDragPreview: connect.dragPreview(),
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging(),
	};
}
const targetSource = {
	drop(props: KeyedHookProps, monitor: any) {
		if (monitor.didDrop()) {
			return;
		}
		const { newKey, name, key } = props.file;
		const currKey = newKey || name || key;
		const slashIndex = currKey.lastIndexOf("/");
		const path = slashIndex !== -1 ? currKey.substr(0, slashIndex + 1) : "";
		const item = monitor.getItem();
		if (item.files && props.browserProps.createFiles) {
			props.browserProps.createFiles(item.files, path);
		}
		return {
			path: path,
		};
	},
};

function targetCollect(/*connect: any,*/ monitor: any) {
	return {
		/*connectDropTarget: connect.dropTarget(),*/
		isOver: monitor.isOver({ shallow: true }),
	};
}

const BaseFileConnectors = {
	dragSource,
	dragCollect,
	targetSource,
	targetCollect,
};

export { useFile, BaseFileConnectors };
