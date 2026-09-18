import { app } from '../server/app';

export default function handler(req: any, res: any) {
  if (req.query && req.query.slug) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    if (slug) {
      const search = req.url && req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      req.url = `/api/${slug}${search}`;
    }
  }
  return app(req, res);
}
