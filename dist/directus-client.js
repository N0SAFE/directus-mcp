import { createDirectus, rest, authentication, staticToken } from '@directus/sdk';
import { z } from 'zod';
export const DirectusConfigSchema = z.object({
    url: z.string().url(),
    token: z.string()
});
export class DirectusClient {
    client;
    token;
    baseUrl;
    constructor(config) {
        this.baseUrl = config.url;
        this.client = createDirectus(this.baseUrl)
            .with(rest())
            .with(authentication())
            .with(staticToken(config.token));
        this.token = config.token;
    }
    async listItems(collection, query) {
        const url = `/items/${collection}`;
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to list items from ${collection}`);
        }
        return await response.json();
    }
    async createItem(collection, data) {
        const url = `/items/${collection}`;
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to create item in ${collection}`);
        }
        return await response.json();
    }
    async readItem(collection, id) {
        const url = `/items/${collection}/${id}`;
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to read item ${id} from ${collection}`);
        }
        return await response.json();
    }
    async updateItem(collection, id, data) {
        const url = `/items/${collection}/${id}`;
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to update item ${id} in ${collection}`);
        }
        return await response.json();
    }
    async deleteItem(collection, id) {
        const url = `/items/${collection}/${id}`;
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to delete item ${id} from ${collection}`);
        }
        return await response.json();
    }
    async getCollectionFields(collection) {
        try {
            const response = await fetch(`${this.baseUrl}/fields/${collection}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch schema for collection ${collection}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching schema for collection ${collection}:`, error);
            return null;
        }
    }
    async getSchemaSnapshot() {
        try {
            const response = await fetch(`${this.baseUrl}/schema/snapshot`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch schema snapshot');
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching schema snapshot:', error);
            throw error;
        }
    }
}
