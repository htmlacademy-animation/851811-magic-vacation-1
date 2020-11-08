export default (loader, url) => {
  return new Promise((resolve, reject) => {
    loader.load(url, (data) => resolve(data), null, reject);
  });
};
