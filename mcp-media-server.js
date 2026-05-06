#!/usr/bin/env node

/**
 * Media Management MCP Server
 * ✅ Query, upload, delete media files in Supabase storage
 */

const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class MCPMediaServer {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
    this.setupHandlers();
  }

  setupHandlers() {
    this.rl.on("line", async (line) => {
      try {
        const message = JSON.parse(line);
        const response = await this.handleMessage(message);
        console.log(JSON.stringify(response));
      } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
      }
    });
  }

  async handleMessage(message) {
    const { jsonrpc, id, method, params } = message;

    // MCP initialization
    if (method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {
              listChanged: true,
            },
          },
          serverInfo: {
            name: "media-mcp",
            version: "1.0.0",
          },
        },
      };
    }

    // List available tools
    if (method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "list_media",
              description: "List all media files in Supabase storage",
              inputSchema: {
                type: "object",
                properties: {
                  limit: { type: "number", default: 20 },
                  offset: { type: "number", default: 0 },
                },
              },
            },
            {
              name: "get_media",
              description: "Get details of a media file",
              inputSchema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                },
                required: ["id"],
              },
            },
            {
              name: "delete_media",
              description: "Delete a media file",
              inputSchema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                },
                required: ["id"],
              },
            },
            {
              name: "upload_media_local",
              description: "Upload a local file to Supabase storage",
              inputSchema: {
                type: "object",
                properties: {
                  filepath: { type: "string", description: "Local file path" },
                  bucket_path: { type: "string", description: "Destination path in bucket" },
                },
                required: ["filepath"],
              },
            },
            {
              name: "get_signed_url",
              description: "Generate a signed URL for private media",
              inputSchema: {
                type: "object",
                properties: {
                  bucket_path: { type: "string" },
                  expires_in: { type: "number", default: 3600 },
                },
                required: ["bucket_path"],
              },
            },
            {
              name: "bucket_info",
              description: "Get storage bucket information",
              inputSchema: {
                type: "object",
                properties: {},
              },
            },
          ],
        },
      };
    }

    // Tool execution
    if (method === "tools/call") {
      const { name, arguments: args } = params;
      const result = await this.executeTool(name, args);
      return {
        jsonrpc: "2.0",
        id,
        result: {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      };
    }

    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "Method not found" },
    };
  }

  async executeTool(name, args) {
    switch (name) {
      case "list_media": {
        const { data, error } = await supabase
          .from("media")
          .select("*")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(args.limit || 20)
          .range(args.offset || 0, (args.offset || 0) + (args.limit || 20) - 1);

        if (error) throw error;
        return { media: data };
      }

      case "get_media": {
        const { data, error } = await supabase
          .from("media")
          .select("*")
          .eq("id", args.id)
          .single();

        if (error) throw error;
        if (data) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/page-media/${data.bucket_path}`;
          return { ...data, url: publicUrl };
        }
        return { error: "Not found" };
      }

      case "delete_media": {
        const { data: media, error: getError } = await supabase
          .from("media")
          .select("bucket_path")
          .eq("id", args.id)
          .single();

        if (getError) throw getError;

        const { error: storageError } = await supabase.storage
          .from("page-media")
          .remove([media.bucket_path]);

        if (storageError) throw storageError;

        const { error: dbError } = await supabase
          .from("media")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", args.id);

        if (dbError) throw dbError;
        return { deleted: true };
      }

      case "upload_media_local": {
        const filepath = args.filepath;
        if (!fs.existsSync(filepath)) {
          throw new Error(`File not found: ${filepath}`);
        }

        const fileBuffer = fs.readFileSync(filepath);
        const filename = path.basename(filepath);
        const bucketPath = args.bucket_path || `uploads/${Date.now()}-${filename}`;

        const { data, error } = await supabase.storage
          .from("page-media")
          .upload(bucketPath, fileBuffer, { upsert: true });

        if (error) throw error;

        const publicUrl = `${supabaseUrl}/storage/v1/object/public/page-media/${bucketPath}`;
        return { uploaded: true, path: bucketPath, url: publicUrl };
      }

      case "get_signed_url": {
        const { data, error } = await supabase.storage
          .from("page-media")
          .createSignedUrl(args.bucket_path, args.expires_in || 3600);

        if (error) throw error;
        return { signed_url: data?.signedUrl };
      }

      case "bucket_info": {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;

        const pageMediaBucket = data?.find((b) => b.name === "page-media");
        return { buckets: data, page_media: pageMediaBucket };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}

new MCPMediaServer();
