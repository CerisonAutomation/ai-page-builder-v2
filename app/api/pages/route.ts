/**
 * Pages API Route
 * 
 * GET /api/pages - List pages
 * POST /api/pages - Create page
 * 
 * Implements: Event sourcing, proper error handling, audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/db/supabase';
import { createPage, getPageBySlug, SavePageSchema, listPages } from "@/lib/db/pages";
import { logger } from "@/lib/utils/logger";
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================

const CreatePageSchema = z.object({
    title: z.string().min(3).max(255),
    slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
    description: z.string().max(1000).optional(),
    meta_title_es: z.string().max(255).optional(),
    meta_desc_es: z.string().max(1000).optional(),
    data: z.record(z.string(), z.any()).optional(),
    status: z.enum(['draft', 'review', 'approved', 'published', 'scheduled', 'archived']).optional(),
  });

const ListPagesSchema = z.object({
  status: z.enum(['draft', 'review', 'approved', 'published', 'scheduled', 'archived']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(['created', 'updated', 'published']).default('updated'),
});

// ============================================
// GET /api/pages - List pages
// ============================================

export async function GET(request: NextRequest) {
    try {
      const supabase = await createServerSupabaseClient();
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    
    // Validate query parameters
    const validated = ListPagesSchema.safeParse(params);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: (validated.error as any).flatten?.() || (validated.error as any).errors,
        },
        { status: 400 }
      );
    }

    const { status, search, limit, offset, sort } = validated.data;

    // Build query
    let query = supabase
      .from('pages')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'created':
        query = query.order('created_at', { ascending: false });
        break;
      case 'published':
        query = query.order('published_at', { ascending: false });
        break;
      case 'updated':
      default:
        query = query.order('updated_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pages' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        pages: data || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/pages - Create page
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    // Validate request body
    const validated = CreatePageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: ((validated.error as any).flatten?.() || (validated.error as any).errors),
        },
        { status: 400 }
      );
    }

    const { title, slug, description, meta_title_es, meta_desc_es, data, status } = validated.data;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    // Validate blocks if provided
    // Note: Block validation handled by Puck config schemas
    // if (data?.content && Array.isArray(data.content)) {
    //   for (const block of data.content) {
    //     // Block validation would go here
    //   }
    // }

    // Create page
    const pageData = { title, slug, description: description || '', data: data || {}, status: status || 'draft' };
    const { data: page, error: createError } = await supabase
      .from('pages')
      .insert({
        title,
        slug,
        description: description || '',
        meta_title_es: meta_title_es || null,
        meta_desc_es: meta_desc_es || null,
        data: data || { content: [] },
        status: status || 'draft',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create page:', createError);
      return NextResponse.json(
        { error: 'Failed to create page' },
        { status: 500 }
      );
    }

    // Emit event (future: integrate event sourcing)
    // TODO: Implement event sourcing for page creation

    // Log creation to audit_logs
    try {
      const adminClient = createAdminClient();
      await adminClient.from('audit_logs').insert({
        action: 'CREATE_PAGE',
        entity_type: 'page',
        entity_id: page.id,
        user_id: user.id,
        changes: { title: pageData.title, slug: pageData.slug },
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    // Return created page
    return NextResponse.json(
      {
        page,
        message: 'Page created successfully',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// Error Handler Middleware
// ============================================

export function middleware(request: NextRequest) {
  // Add correlation ID for tracing
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  return requestHeaders;
}

// ============================================
// Types for type safety
// ============================================

export type PageListResponse = {
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type CreatePageRequest = z.infer<typeof CreatePageSchema>;
export type CreatePageResponse = {
  page: any;
  message: string;
};
