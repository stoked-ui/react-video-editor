import { KeyedFile } from "../../common";

export class FileProps {
	action?: any;
	browserProps: any;
	depth: number;
	file: KeyedFile;
	keyDerived?: boolean;
	isDraft: boolean;
	isOpen: boolean;
	isDragging: boolean;
	isDeleting: boolean;
	isOver: boolean;
	isRenaming: boolean;
	isSelectable?: boolean;
	isSelected: boolean;
	name?: string;
	newName?: string;
	showName?: boolean;
	showSize?: boolean;
	showModified?: boolean;
	thumbnail_url?: string;

	constructor({
		action,
		browserProps,
		depth = 0,
		file,
		keyDerived,
		isDraft = false,
		isOpen = false,
		isDragging = false,
		isDeleting = false,
		isOver = false,
		isRenaming = false,
		isSelectable = true,
		isSelected = false,
		name,
		newName,
		showName = true,
		showSize = true,
		showModified = true,
		thumbnail_url,
	}: {
		action?: any;
		browserProps: any;
		depth: number;
		file: KeyedFile;
		keyDerived?: boolean;
		isDraft: boolean;
		isDragging: boolean;
		isDeleting: boolean;
		isOpen: boolean;
		isOver: boolean;
		isRenaming: boolean;
		isSelectable?: boolean;
		isSelected: boolean;
		name?: string;
		newName?: string;
		showName?: boolean;
		showSize?: boolean;
		showModified?: boolean;
		thumbnail_url?: string;
	}) {
		this.action = action;
		this.browserProps = browserProps;
		this.depth = depth;
		this.file = file;
		this.keyDerived = keyDerived;
		this.isDraft = isDraft;
		this.isDragging = isDragging;
		this.isDeleting = isDeleting;
		this.isRenaming = isRenaming;
		this.isOpen = isOpen;
		this.isOver = isOver;
		this.isRenaming = isRenaming;
		this.isSelectable = isSelectable;
		this.isSelected = isSelected;
		this.name = name;
		this.newName = newName;
		this.showName = showName;
		this.showSize = showSize;
		this.showModified = showModified;
		this.thumbnail_url = thumbnail_url;
	}
}
