import type { FunctionComponent } from "@common/types";
import Rve from '@components/Rve';

export const Demo = (): FunctionComponent => {
	return <Rve source={null} className={'h-screen'} variant={'minimized'} />;
};
