import { ListFile } from "./ListFile";
import { FileProps } from "../Files";
import React from "react";

const BaseFile: React.FC<FileProps> = (props: FileProps) => {
	return (
		<ListFile
			{...props}
			showName={false}
			showSize={false}
			showModified={false}
			isSelectable={false}
		/>
	);
};

export { BaseFile };
