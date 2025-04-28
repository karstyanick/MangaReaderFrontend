declare module "*.png";
declare module "*.svg";
declare module "*.jpeg";
declare module "*.jpg";

declare interface Navigator {
	wakeLock: {
		request(type?: 'screen'): Promise<WakeLockSentinel>;
	};
}


