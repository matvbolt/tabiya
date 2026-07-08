import { supabase } from "./supabase";

export type Article = {
  id: string;
  author_id: string | null;
  title: string;
  summary: string | null;
  body: string;
  tag: string | null;
  premium_cost: number;
  likes: number;
  comments: number;
  views: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  author?: { username: string; badge: string | null; name_style: string | null };
};

export const listArticles = async (): Promise<Article[]> => {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  const rows = (data as Article[]) ?? [];
  const ids = Array.from(new Set(rows.map((r) => r.author_id).filter(Boolean)));
  if (ids.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, badge, name_style")
      .in("id", ids as string[]);
    const byId = new Map(
      ((profs as { id: string; username: string; badge: string | null; name_style: string | null }[]) ??
        []).map((p) => [p.id, p])
    );
    for (const r of rows) {
      const a = r.author_id ? byId.get(r.author_id) : undefined;
      if (a) r.author = { username: a.username, badge: a.badge, name_style: a.name_style };
    }
  }
  return rows;
};

export const getArticle = async (id: string): Promise<Article | null> => {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();
  const row = data as Article | null;
  if (row?.author_id) {
    const { data: a } = await supabase
      .from("profiles")
      .select("username, badge, name_style")
      .eq("id", row.author_id)
      .single();
    if (a) row.author = a as { username: string; badge: string | null; name_style: string | null };
  }
  return row;
};

export const createArticle = async (
  authorId: string,
  fields: {
    title: string;
    summary: string;
    body: string;
    tag: string;
    premium_cost: number;
  }
): Promise<{ id: string | null; error: string | null }> => {
  const { data, error } = await supabase
    .from("articles")
    .insert({ author_id: authorId, ...fields })
    .select("id")
    .single();
  return {
    id: (data as { id: string } | null)?.id ?? null,
    error: error?.message ?? null,
  };
};

export const updateArticle = async (
  id: string,
  fields: {
    title: string;
    summary: string;
    body: string;
    tag: string;
    premium_cost: number;
  }
): Promise<{ error: string | null }> => {
  const { error } = await supabase
    .from("articles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
};

export const updateComment = async (id: string, body: string) => {
  await supabase
    .from("article_comments")
    .update({ body, updated_at: new Date().toISOString() })
    .eq("id", id);
};

export const likeArticle = async (id: string) => {
  await supabase.rpc("like_article", { p_article_id: id });
};

export const unlockArticle = async (
  id: string
): Promise<{ error: string | null }> => {
  const { error } = await supabase.rpc("unlock_article", { p_article_id: id });
  return { error: error?.message ?? null };
};

export type Comment = {
  id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  author?: { username: string; badge: string | null; name_style: string | null };
};

export const listComments = async (articleId: string): Promise<Comment[]> => {
  const { data } = await supabase
    .from("article_comments")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });
  const rows = (data as Comment[]) ?? [];
  const ids = Array.from(new Set(rows.map((r) => r.author_id).filter(Boolean)));
  if (ids.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, badge, name_style")
      .in("id", ids as string[]);
    const byId = new Map(
      ((profs as { id: string; username: string; badge: string | null; name_style: string | null }[]) ??
        []).map((p) => [p.id, p])
    );
    for (const r of rows) {
      const a = r.author_id ? byId.get(r.author_id) : undefined;
      if (a) r.author = { username: a.username, badge: a.badge, name_style: a.name_style };
    }
  }
  return rows;
};

export const addComment = async (
  articleId: string,
  authorId: string,
  body: string
): Promise<{ error: string | null }> => {
  const { error } = await supabase
    .from("article_comments")
    .insert({ article_id: articleId, author_id: authorId, body });
  return { error: error?.message ?? null };
};

export const deleteComment = async (id: string) => {
  await supabase.from("article_comments").delete().eq("id", id);
};

export const getMyArticleState = async (
  userId: string
): Promise<{ likes: Set<string>; unlocks: Set<string> }> => {
  const [l, u] = await Promise.all([
    supabase.from("article_likes").select("article_id").eq("user_id", userId),
    supabase.from("article_unlocks").select("article_id").eq("user_id", userId),
  ]);
  return {
    likes: new Set(
      ((l.data as { article_id: string }[]) ?? []).map((r) => r.article_id)
    ),
    unlocks: new Set(
      ((u.data as { article_id: string }[]) ?? []).map((r) => r.article_id)
    ),
  };
};
