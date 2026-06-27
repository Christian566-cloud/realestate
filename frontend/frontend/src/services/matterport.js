const MATTERPORT_DOMAINS = ['my.matterport.com', 'matterport.com'];
const MATTERPORT_EMBED_HOST = 'my.matterport.com';

export function isMatterportUrl(url) {
  if (!url) return false;
  try {
    return MATTERPORT_DOMAINS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

function getMatterportModelId(url) {
  try {
    const u = new URL(url);
    const mParam = u.searchParams.get('m');
    if (mParam) return mParam;

    const modelMatch = u.pathname.match(/\/models?\/([a-zA-Z0-9_-]+)/);
    if (modelMatch) return modelMatch[1];

    const showMatch = u.pathname.match(/\/show\/?$/);
    if (showMatch) return u.searchParams.get('m');
  } catch {
    return null;
  }
  return null;
}

export function getMatterportEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!MATTERPORT_DOMAINS.includes(u.hostname)) {
      return url;
    }

    const modelId = getMatterportModelId(url);
    if (modelId) {
      return `https://${MATTERPORT_EMBED_HOST}/show/?m=${modelId}`;
    }
  } catch {
    return url;
  }
  return url;
}
