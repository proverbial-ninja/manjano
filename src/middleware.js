import { auth } from "./lib/auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const url_path = context.originPathname;

  if (url_path.startsWith("/api") && !url_path.startsWith("/api/auth")) {
    const isAuthed = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (isAuthed) {
      context.locals.user = isAuthed.user;
      context.locals.session = isAuthed.session;
    } else {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
  }

  return next();
});
