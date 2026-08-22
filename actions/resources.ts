'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ResourceType = 'content_hub' | 'free_resource';

// Returns the distinct category names already used for this section,
// so the upload form can offer them as a dropdown.
export async function getResourceCategories(type: ResourceType) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('resources')
    .select('category')
    .eq('type', type);

  if (error) {
    console.error('getResourceCategories error:', error);
    return [];
  }

  const unique = Array.from(
    new Set((data ?? []).map((row) => row.category).filter(Boolean))
  );

  return unique.sort((a, b) => a.localeCompare(b));
}

// Same as above but with item counts — used for the category index pages.
export async function getResourceCategorySummaries(type: ResourceType) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('resources')
    .select('category')
    .eq('type', type);

  if (error) {
    console.error('getResourceCategorySummaries error:', error);
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.category) continue;
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export async function getResourcesByCategory(type: ResourceType, category: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('type', type)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getResourcesByCategory error:', error);
    return [];
  }

  return data ?? [];
}

export async function createResource(formData: FormData) {
  const supabase = await createClient();

  const type = formData.get('type') as ResourceType;
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const url = formData.get('url') as string;
  const thumbnail_url = (formData.get('thumbnail_url') as string) || null;

  // If the admin picked "+ Add new category", the real name comes from
  // the new_category field instead of the select's value.
  let category = (formData.get('category') as string)?.trim();
  const newCategory = (formData.get('new_category') as string)?.trim();
  if (category === '__new__' && newCategory) {
    category = newCategory;
  }
  if (!category || category === '__new__') {
    category = 'Uncategorized';
  }

  const { error } = await supabase.from('resources').insert({
    type,
    title,
    description,
    url,
    thumbnail_url,
    category,
  });

  if (error) {
    console.error('createResource error:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/resources');
  revalidatePath(type === 'content_hub' ? '/content-hub' : '/free-resources');

  return { success: true };
}