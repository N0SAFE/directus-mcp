import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DirectusClient } from "./directus-client.js";
// Create an MCP server
const server = new McpServer({
    name: "DirectusMCP",
    version: "1.0.0"
});
const directusClient = new DirectusClient({
    url: process.env.DIRECTUS_URL || "",
    token: process.env.DIRECTUS_TOKEN || ""
});
// Define the item schema
const ItemSchema = z.object({
    data: z.record(z.any())
});
// Add CRUD operations as tools
server.tool("create", { collection: z.string(), data: z.record(z.any()) }, async ({ collection, data }) => {
    const result = await directusClient.createItem(collection, data);
    return {
        content: [{
                type: "text",
                text: JSON.stringify(result)
            }]
    };
});
server.tool("update", { collection: z.string(), id: z.string(), data: z.record(z.any()) }, async ({ collection, id, data }) => {
    const result = await directusClient.updateItem(collection, id, data);
    return {
        content: [{
                type: "text",
                text: JSON.stringify(result)
            }]
    };
});
server.tool("delete", { collection: z.string(), id: z.string() }, async ({ collection, id }) => {
    await directusClient.deleteItem(collection, id);
    return {
        content: [{
                type: "text",
                text: "Item deleted successfully"
            }]
    };
});
// Define list callback for resource template
const listCallback = async () => {
    return {
        resources: [{
                name: "Collection Items",
                uri: "items://{collection}",
                description: "List items in a collection"
            }]
    };
};
// Add a dynamic resource for items
server.resource("items", new ResourceTemplate("items://{collection}/{id?}", { list: listCallback }), async (uri, params) => {
    const collection = Array.isArray(params.collection) ? params.collection[0] : params.collection;
    const id = params.id && (Array.isArray(params.id) ? params.id[0] : params.id);
    // Fetch the collection schema
    const schema = await directusClient.getCollectionFields(collection);
    if (id) {
        const item = await directusClient.readItem(collection, id);
        return {
            contents: [{
                    uri: uri.href,
                    text: JSON.stringify(item)
                }],
            schema: schema ? {
                type: "object",
                properties: schema.data,
                title: `${collection} Item Schema`
            } : undefined
        };
    }
    else {
        const itemsResponse = await directusClient.listItems(collection);
        return {
            contents: itemsResponse.data.map((item) => ({
                uri: `items://${collection}/${item.id}`,
                text: JSON.stringify(item)
            })),
            schema: schema ? {
                type: "object",
                properties: schema.data,
                title: `${collection} Collection Schema`
            } : undefined
        };
    }
});
// Define list callback for schema template
const schemaListCallback = async () => {
    return {
        resources: [{
                name: "Schema Snapshot",
                uri: "schema://snapshot",
                description: "Get complete schema snapshot from Directus"
            }]
    };
};
// Add schema snapshot resource
server.resource("schema", new ResourceTemplate("schema://snapshot", { list: schemaListCallback }), async (uri) => {
    const snapshot = await directusClient.getSchemaSnapshot();
    return {
        contents: [{
                uri: uri.href,
                text: JSON.stringify(snapshot),
            }],
        schema: {
            type: "object",
            title: "Directus Schema Snapshot",
            description: "Complete schema snapshot from Directus instance"
        }
    };
});
// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
