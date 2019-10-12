import crypto from 'crypto';

const preRender = (content, res) => {
  const etag = crypto
    .createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');

  if (res) {
    res.setHeader('cache-control', 's-maxage=1, stale-while-revalidate');
    res.setHeader('x-version', etag);
  }
};

export default preRender;
