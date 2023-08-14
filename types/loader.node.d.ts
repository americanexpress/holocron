export default createLoader;
/**
 * Creates a loader that can be use for modules and externals
 * @param {Object} options
 * @param {string} options.context what's being loaded (e.g. module)
 * @param {number} options.maxRetries limit of retries
 * @param {number} options.maxSockets limit of sockets
 * @param {(url: string) => boolean} options.isInBlockList checks if asset url is in block list
 * @param {(url: string) => void} options.addToBlockList adds asset url into block list
 * @returns
 */
declare function createLoader({ context, maxRetries, maxSockets, isInBlockList, addToBlockList, }: {
    context: string;
    maxRetries: number;
    maxSockets: number;
    isInBlockList: (url: string) => boolean;
    addToBlockList: (url: string) => void;
}): (assetName: string, { node: { integrity, url } }: {
    node: {
        url: string;
        integrity: string;
    };
    browser: {
        url: string;
        integrity: string;
    };
}, onLoad?: (data: {
    assetName: string;
    asset: any;
}) => any) => Promise<any>;
