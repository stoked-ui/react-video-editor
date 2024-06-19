// @ts-ignore
/// <reference types="../../types/react-keyed-file-browser.d.ts" />
import React, { ReactElement, useState } from "react";
import type { FunctionComponent } from "../common/types";
import { GroupedThumbnails } from "../features/GroupedThumbnails.tsx";
import '../styles/demo.css';

import FileBrowser, { Icons, Groupers, FileRenderers, FolderRenderers } from "react-keyed-file-browser";
/*
import FlatSimple from "../features/FlatSimple.tsx";
import NestedEditableDemo from "../features/NestedTableWEvents.tsx";
*/
import { subDays, subHours, subMonths } from "date-fns";

export const Demo = (): FunctionComponent => {
	return (
		<>
			<div className="header">
				<div className="content-container">
					<a className="title" href="/react-keyed-file-browser/">React Keyed File Browser</a>
					<span style={{ marginLeft: '20px' }}>
						<a href="https://github.com/uptick/react-keyed-file-browser">GitHub</a>
						&nbsp;|&nbsp;
						<a href="https://www.npmjs.com/package/react-keyed-file-browser">NPM</a>
					</span>
				</div>
			</div>

			<div className={"content"}>
				<div className="content-container">
					<div className="page-header">
						<h1>Live Demo</h1>
					</div>
					<p>To participate in the demonstration you will need:</p>
					<ul>
						<li>Javascript enabled</li>
						<li>A modern browser</li>
					</ul>
					<p>All examples given are written with babel loaders to support es6 (stage-0) and JSX syntax.</p>

					<h2>Simple Flat &amp; Read-Only Example</h2>
					<p>This example demonstrates read-only use of the browser, with a flat list of files (the keys do
						not contain any forward slashes so no folders are drawn).</p>
					<div className="demo-mount-flat-simple"></div>
					{/*<FlatSimple />*/}

					<h2>Nested Table with Event Handlers</h2>
					<p>In this example, the files are contained within common folders as indicated by the forward
						slash in the file keys.</p>
					<p>Simple event handlers are also provided as props to the browser, which allow it to respond to
						actions on the files. The presence of these handlers enables the buttons and/or the drag &amp;
						drop responsiveness.</p>
					<p>This example is not connected to any file storage backend; it simply takes all changes made by
						the user and assumes that they would have been successful.</p>
					<div className="demo-mount-nested-editable"></div>
					{/*<NestedEditableDemo />*/}

					<h2>Different Renderers and Groupers</h2>
					<p>In this example, the files and folder renderers have been replaced with Thumbnail renderers.
						Files are grouped by their month modified rather than their keyed folder structure.</p>
					<div className="demo-mount-grouped-thumbnails"></div>
					<GroupedThumbnails />
					<FileBrowser
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
					/>
				</div>
			</div>
		</>
	);
};
