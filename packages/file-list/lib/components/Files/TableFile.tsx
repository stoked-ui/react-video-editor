import React from "react";
import ClassNames from "classnames";
import { formatDistanceToNow } from "date-fns";

import { ConfirmDelete } from "../Confirm";
import { useFile } from "../../hooks";
import { FileProps } from "../Files";

const RawTableFile: React.FC<FileProps> = (props) => {
	const {
		action,
		isDragging,
		isDeleting,
		isRenaming,
		isOver,
		isSelected,
		browserProps,
		file: { size, modified, depth, url },
	} = props;

	console.log('props', props);
	const {
		newName,
		getName,
		getFileType,
		selectFileNameFromRef,
		handleFileClick,
		handleItemClick,
		handleItemDoubleClick,
		handleNewNameChange,
		handleRenameSubmit,
		handleDeleteSubmit,
		handleCancelEdit,
		//connectDND,
		fileSize,
	} = useFile(props);

	const icon = browserProps.icons[getFileType()] || browserProps.icons["File"];
	const inAction = isDragging || action;

	let name;
	if (!inAction && isDeleting && browserProps.selection.length === 1) {
		name = (
			<ConfirmDelete
				handleDeleteSubmit={handleDeleteSubmit}
				handleFileClick={handleFileClick}
				url={url}
			>
				{icon}
				{getName()}
			</ConfirmDelete>
		);
	} else if (!inAction && isRenaming) {
		name = (
			<form className="renaming" onSubmit={handleRenameSubmit}>
				{icon}
				<input
					ref={selectFileNameFromRef}
					type="text"
					value={newName}
					onChange={handleNewNameChange}
					onBlur={handleCancelEdit}
					autoFocus
				/>
			</form>
		);
	} else {
		name = (
			<a href={url || "#"} download="download" onClick={handleFileClick}>
				{icon}
				{getName()}
			</a>
		);
	}

	let draggable = <div>{name}</div>;
	if (typeof browserProps.moveFile === "function") {
		//const connectDragSource = connectDragPreview(draggable);
		/*if (connectDragSource) {
      draggable = connectDragSource;
    }*/
	}

	const row = (
		<tr
			className={ClassNames("file", {
				pending: action,
				dragging: isDragging,
				dragover: isOver,
				selected: isSelected,
			})}
			onClick={handleItemClick}
			onDoubleClick={handleItemDoubleClick}
		>
			<td className="name">
				<div style={{ paddingLeft: depth * 16 + "px" }}>{draggable}</div>
			</td>
			<td className="size">{fileSize(size || 0)}</td>
			<td className="modified">
				{typeof modified === "undefined"
					? "-"
					: formatDistanceToNow(modified, { addSuffix: true })}
			</td>
		</tr>
	);

	//return connectDND(row);
	return row;
};

const TableFile: React.FC<FileProps> = (props) => {
	return <RawTableFile {...props} />;
};

export { RawTableFile, TableFile };
