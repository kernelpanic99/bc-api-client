import { BigCommerceClient } from 'src/client';
import { BCCredentialsError } from 'src/errors';
import { describe, expect, it } from 'vitest';

describe('BigCommerceClient constructor', () => {
    it('Fails to constuct the instance with invalid credentials', () => {
        expect(() => new BigCommerceClient({ storeHash: '', accessToken: '' })).toThrow(BCCredentialsError);
    });
});
