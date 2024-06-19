import { FileBrowser } from "../browser.tsx";
import { subDays, subHours } from "date-fns";

export default function FlatSimple () {
	return <FileBrowser
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
		]}
	/>
}
