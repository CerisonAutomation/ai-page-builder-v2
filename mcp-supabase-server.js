#!/usr/bin/env node

/**
 * Supabase MCP Server
 * Provides tools to query Supabase database, manage auth, and access docs
 * 
 * Usage:
 * node mcp-supabase-server.js
 * 
 * Then add to Vellum:
 * assistant mcp add supabase-local -t stdio -c node -a /path/to/mcp-supabase-server.js
 */

const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MCP Protocol Handler
class MCPServer {
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
            name: "supabase-mcp",
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
              name: "query_pages",
              description: "Query pages table from Supabase",
              inputSchema: {
                type: "object",
                properties: {
                  filters: {
                    type: "object",
                    description: "Filter conditions (published, created_by, etc)",
                  },
                  limit: { type: "number", default: 10 },
                },
              },
            },
            {
              name: "get_page",
              description: "Get a single page by slug",
              inputSchema: {
                type: "object",
                properties: {
                  slug: { type: "string", description: "Page slug" },
                },
                required: ["slug"],
              },
            },
            {
              name: "save_page",
              description: "Save or update a page",
              inputSchema: {
                type: "object",
                properties: {
                  slug: { type: "string" },
                  title: { type: "string" },
                  data: { type: "object", description: "Puck page data" },
                  published: { type: "boolean" },
                },
                required: ["slug", "title", "data"],
              },
            },
            {
              name: "list_pages",
              description: "List all pages with pagination",
              inputSchema: {
                type: "object",
                properties: {
                  published_only: { type: "boolean", default: false },
                  limit: { type: "number", default: 20 },
                  offset: { type: "number", default: 0 },
                },
              },
            },
            {
              name: "delete_page",
              description: "Delete a page (soft delete)",
              inputSchema: {
                type: "object",
                properties: {
                  slug: { type: "string" },
                },
                required: ["slug"],
              },
            },
            {
              name: "get_versions",
              description: "Get version history for a page",
              inputSchema: {
                type: "object",
                properties: {
                  page_id: { type: "string" },
                  limit: { type: "number", default: 10 },
                },
                required: ["page_id"],
              },
            },
            {
              name: "list_media",
              description: "List media files",
              inputSchema: {
                type: "object",
                properties: {
                  limit: { type: "number", default: 20 },
                },
              },
            },
            {
              name: "get_audit_logs",
              description: "Get audit logs for an entity",
              inputSchema: {
                type: "object",
                properties: {
                  entity_id: { type: "string" },
                  limit: { type: "number", default: 50 },
                },
                required: ["entity_id"],
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
      case "query_pages": {
        let query = supabase.from("pages").select("*");
        if (args.filters?.published) {
          query = query.eq("published", true);
        }
        if (args.filters?.created_by) {
          query = query.eq("created_by", args.filters.created_by);
        }
        query = query.limit(args.limit || 10);
        const { data, error } = await query;
        if (error) throw error;
        return { pages: data };
      }

      case "get_page": {
        const { data, error } = await supabase
          .from("pages")
          .select("*")
          .eq("slug", args.slug)
          .single();
        if (error) throw error;
        return data;
      }

      case "save_page": {
        const { data: existing } = await supabase
          .from("pages")
          .select("id")
          .eq("slug", args.slug)
          .single();

        if (existing) {
          const { data, error } = await supabase
            .from("pages")
            .update({
              title: args.title,
              data: args.data,
              published: args.published,
              updated_at: new Date().toISOString(),
            })
            .eq("slug", args.slug)
            .select();
          if (error) throw error;
          return { saved: true, page: data[0] };
        } else {
          const { data, error } = await supabase
            .from("pages")
            .insert([
              {
                slug: args.slug,
                title: args.title,
                data: args.data,
                published: args.published || false,
              },
            ])
            .select();
          if (error) throw error;
          return { created: true, page: data[0] };
        }
      }

      case "list_pages": {
        let query = supabase.from("pages").select("id, slug, title, published, created_at, updated_at");
        if (args.published_only) {
          query = query.eq("published", true);
        }
        query = query.order("updated_at", { ascending: false })
          .limit(args.limit || 20)
          .range(args.offset || 0, (args.offset || 0) + (args.limit || 20) - 1);
        const { data, error } = await query;
        if (error) throw error;
        return { pages: data, count: data.length };
      }

      case "delete_page": {
        const { data, error } = await supabase
          .from("pages")
          .update({ deleted_at: new Date().toISOString() })
          .eq("slug", args.slug)
          .select();
        if (error) throw error;
        return { deleted: true };
      }

      case "get_versions": {
        const { data, error } = await supabase
          .from("page_versions")
          .select("*")
          .eq("page_id", args.page_id)
          .order("created_at", { ascending: false })
          .limit(args.limit || 10);
        if (error) throw error;
        return { versions: data };
      }

      case "list_media": {
        const { data, error } = await supabase
          .from("media")
          .select("*")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(args.limit || 20);
        if (error) throw error;
        return { media: data };
      }

      case "get_audit_logs": {
        const { data, error } = await supabase
          .from("audit_logs")
          .select("*")
          .eq("entity_id", args.entity_id)
          .order("created_at", { ascending: false })
          .limit(args.limit || 50);
        if (error) throw error;
        return { logs: data };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}

// Start server
new MCPServer();
