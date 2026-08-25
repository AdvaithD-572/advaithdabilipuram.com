interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Environment {
  ASSETS: AssetsBinding;
}

const hasFileExtension = (pathname: string) => /\.[^/]+$/.test(pathname);

export default {
  async fetch(request: Request, environment: Environment): Promise<Response> {
    const response = await environment.ASSETS.fetch(request);
    const url = new URL(request.url);

    if (response.status !== 404 || hasFileExtension(url.pathname)) {
      return response;
    }

    const fallbackUrl = new URL('/index.html', url);
    return environment.ASSETS.fetch(new Request(fallbackUrl, request));
  },
};
