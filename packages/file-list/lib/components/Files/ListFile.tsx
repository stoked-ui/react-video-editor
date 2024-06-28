import ClassNames from "classnames";
import { formatDistanceToNow } from "date-fns";
import { useFile } from "../../hooks/useFile";
import { FileProps } from "../Files";

export function RawListFile(props: FileProps) {
	const {
		thumbnail_url: thumbnailUrl,
		action,
		file: { url },
		isDragging,
		isRenaming,
		isSelected,
		isSelectable,
		isOver,
		isDeleting,
		showName = true,
		showSize = true,
		showModified = true,
		browserProps,
	} = props;

	console.log('useFile', props);
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

	let icon;
	if (thumbnailUrl) {
		icon = (
			<div
				className="image"
				style={{
					backgroundImage: "url(" + thumbnailUrl + ")",
				}}
			/>
		);
	} else {
		icon = browserProps.icons[getFileType()] || browserProps.icons.File;
	}

	const inAction = isDragging || action;

	const ConfirmDeletionRenderer = browserProps.confirmDeletionRenderer;

	let name;
	if (showName) {
		if (!inAction && isDeleting && browserProps.selection.length === 1) {
			name = (
				<ConfirmDeletionRenderer
					handleDeleteSubmit={handleDeleteSubmit}
					handleFileClick={handleFileClick}
					url={url}
				>
					{getName()}
				</ConfirmDeletionRenderer>
			);
		} else if (!inAction && isRenaming) {
			name = (
				<form className="renaming" onSubmit={handleRenameSubmit}>
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
				<a href={url} download="download" onClick={handleFileClick}>
					{getName()}
				</a>
			);
		}
	}

	let size;
	if (showSize) {
		if (!isRenaming && !isDeleting) {
			size = (
				<span className="size">
					<small>{fileSize(props.file?.size || 0)}</small>
				</span>
			);
		}
	}

	let modified;
	if (showModified) {
		if (!isRenaming && !isDeleting) {
			modified = (
				<span className="modified">
					Last modified:{" "}
					{formatDistanceToNow(props.file?.modified || Date.now(), {
						addSuffix: true,
					})}
				</span>
			);
		}
	}

	let rowProps = {};
	if (isSelectable) {
		rowProps = {
			onClick: handleItemClick,
		};
	}

	let row = (
		<li
			className={ClassNames("file", {
				pending: action,
				dragging: isDragging,
				dragover: isOver,
				selected: isSelected,
			})}
			onDoubleClick={handleItemDoubleClick}
			{...rowProps}
		>
			<div className="item">
				<span className="thumb">{icon}</span>
				<span className="name">{name}</span>
				{size}
				{modified}
			</div>
		</li>
	);

	if (typeof browserProps.moveFile === "function") {
		//const preview = connectDragPreview(row);
		//if (preview !== null) {
		//  row = preview;
		//}
	}

	//return connectDND(row);
	return row;
}

export function ListFile(props: FileProps) {
	return <RawListFile {...props} />;
}
