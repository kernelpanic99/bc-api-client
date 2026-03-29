/**
 * Split an array of strings into chunks by following logic
 *
 * 1. add length of each string + separatorSize to offset
 * 2. if result is greater than `maxLength`, start a new chunk
 * 3. otherwise, add the string to the current chunk until the chunk is of `chunkLength`
 *
 * This function to be used for splitting query params to avoid url length limit
 *
 * @param items array of strings
 * @param options
 * @param options.maxLength max length of the combined strings
 * @param options.chunkLength max length of each chunk
 * @param options.offset offset of the first chunk
 * @param options.separatorSize size of the separator
 */
export const chunkStrLength = (
    items: string[],
    options: {
        maxLength?: number;
        chunkLength?: number;
        offset?: number;
        separatorSize?: number;
    } = {},
) => {
    const { maxLength = 2048, chunkLength = 250, offset = 0, separatorSize = 1 } = options;

    const chunks: string[][] = [];
    let currentStrLength = offset;
    let currentChunk: string[] = [];

    for (const item of items) {
        const itemLength = encodeURIComponent(item).length;
        const separatorLength = currentChunk.length > 0 ? separatorSize : 0;
        const totalItemLength = itemLength + separatorLength;

        // Check if adding this item would exceed limits
        const wouldExceedLength = currentStrLength + totalItemLength > maxLength;
        const wouldExceedCount = currentChunk.length >= chunkLength;

        if ((wouldExceedLength || wouldExceedCount) && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentStrLength = offset;
        }

        // Handle items that are too large even for a new chunk
        if (itemLength + offset > maxLength) {
            // Either skip, truncate, or throw error depending on requirements
            throw new Error(`Item too large: ${itemLength} exceeds maxLength ${maxLength}`);
        }

        currentChunk.push(item);
        currentStrLength += totalItemLength;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
};
