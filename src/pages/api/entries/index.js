export async function GET({ params, request, url, locals }) {
  const id = 12;
  console.log(locals);
  console.log(url);
  console.log(request);
  console.log(params);

  return new Response(JSON.stringify({ locals }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
