export type Database = {
  public: {
    Tables: {
      pages: {
        Row: { id: string; title: string; slug: string; content: any; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['pages']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pages']['Insert']>;
      };
      media: {
        Row: { id: string; name: string; url: string; type: string; size: number; created_at: string };
        Insert: Omit<Database['public']['Tables']['media']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['media']['Insert']>;
      };
      page_versions: {
        Row: { id: string; page_id: string; content: any; created_at: string };
        Insert: Omit<Database['public']['Tables']['page_versions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['page_versions']['Insert']>;
      };
    };
  };
};
