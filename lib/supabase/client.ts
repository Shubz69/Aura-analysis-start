import { createBrowserClient } from "@supabase/ssr";

const emptyPromise = Promise.resolve({ data: null, error: { message: "Supabase not configured" } });
const emptySingle = Promise.resolve({ data: null, error: { message: "Supabase not configured" } });

/** No-op chain for .from().select().eq() etc. when Supabase is not configured */
function noOpChain() {
  const thenable = {
    then: (onFulfilled?: (v: { data: null; error: { message: string } }) => unknown) =>
      Promise.resolve(onFulfilled ? onFulfilled({ data: null, error: { message: "Supabase not configured" } }) : undefined),
    single: () => ({ then: (f?: (v: { data: null; error: { message: string } }) => unknown) => (f ? emptySingle.then(f) : emptySingle) }),
    eq: () => thenable,
    insert: () => thenable,
    update: () => thenable,
    delete: () => thenable,
  };
  return thenable;
}

function createMockClient() {
  return {
    from: () => ({
      select: () => noOpChain(),
      insert: () => noOpChain(),
      update: () => noOpChain(),
      delete: () => noOpChain(),
      eq: () => noOpChain(),
      single: () => ({ then: (f?: (v: { data: null; error: { message: string } }) => unknown) => (f ? emptySingle.then(f) : emptySingle) }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
    removeChannel: () => {},
  } as ReturnType<typeof createBrowserClient>;
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return createMockClient();
  }
  return createBrowserClient(url, anonKey);
}
