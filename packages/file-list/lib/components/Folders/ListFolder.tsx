import React from "react";
import { useFolder } from "../../hooks";

import ClassNames from "classnames";
import { isFolder } from "../../common";
import { FileProps } from "../Files";

const RawListFolder: React.FC<FileProps> = (props) => {
	const {
		isOpen,
		isDragging,
		isDeleting,
		isRenaming,
		isDraft,
		isOver,
		isSelected,
		action,
		browserProps,
		depth,
		//keyDerived,
		file: { url, children: fileChildren },
	} = props;

	const {
		newName,
		getName,
		selectFolderNameFromRef,
		handleDeleteSubmit,
		handleCancelEdit,
		toggleFolder,
		handleFolderClick,
		handleFolderDoubleClick,
		handleNewNameChange,
		handleRenameSubmit,
		//connectDND,
	} = useFolder(props);

	const icon = browserProps.icons[isOpen ? "FolderOpen" : "Folder"];

	const inAction = isDragging || action;

	const ConfirmDeletionRenderer = browserProps.confirmDeletionRenderer;

	let name;
	if (!inAction && isDeleting && browserProps.selection.length === 1) {
		name = (
			<ConfirmDeletionRenderer
				handleDeleteSubmit={handleDeleteSubmit}
				// handleFileClick={handleFileClick}
				url={url}
			>
				{getName()}
			</ConfirmDeletionRenderer>
		);
	} else if ((!inAction && isRenaming) || isDraft) {
		name = (
			<div>
				<form className="renaming" onSubmit={handleRenameSubmit}>
					<input
						type="text"
						ref={selectFolderNameFromRef}
						value={newName}
						onChange={handleNewNameChange}
						onBlur={handleCancelEdit}
						autoFocus
					/>
				</form>
			</div>
		);
	} else {
		name = (
			<div>
				<a onClick={toggleFolder}>{getName()}</a>
			</div>
		);
	}

	let children;
	if (isOpen && browserProps.nestChildren) {
		// TODO: the original has children set to [] here which does not make sense to me rn
		children =
			fileChildren?.map((file: any) => {
				const thisItemProps = {
					...browserProps.getItemProps(file, browserProps),
					depth: depth + 1,
				};

				if (!isFolder(file)) {
					return (
						<browserProps.fileRenderer
							key={file.key}
							file={file}
							{...thisItemProps}
							browserProps={browserProps}
							{...browserProps.fileRendererProps}
						/>
					);
				} else {
					return (
						<browserProps.folderRenderer
							key={file.key}
							file={file}
							{...thisItemProps}
							browserProps={browserProps}
							{...browserProps.folderRendererProps}
						/>
					);
				}
			}) || [];

		children = children.length ? (
			<ul style={{ padding: "0 8px", paddingLeft: "16px" }}>{children}</ul>
		) : (
			<p>No items in this folder</p>
		);
	}

	let folder = (
		<li
			className={ClassNames("folder", {
				expanded: isOpen && browserProps.nestChildren,
				pending: action,
				dragging: isDragging,
				dragover: isOver,
				selected: isSelected,
			})}
			onClick={handleFolderClick}
			onDoubleClick={handleFolderDoubleClick}
		>
			<div className="item">
				<span className="thumb">{icon}</span>
				<span className="name">{name}</span>
			</div>
			{children}
		</li>
	);
	// if (typeof browserProps.moveFolder === 'function' && keyDerived) {
	// folder = connectDragPreview(folder)
	//}

	//return connectDND(folder);
	return folder;
};

const ListFolder: React.FC<FileProps> = (props) => {
	return <RawListFolder {...props} />;
};

export { RawListFolder, ListFolder };
