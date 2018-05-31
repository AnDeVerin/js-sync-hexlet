import http from 'http';
import url from 'url';
import querystring from 'querystring';

const getSearch = (queryParams, params) => {
  const mergedQuery = { ...queryParams, ...params };
  const keys = Object.keys(mergedQuery);
  const newQueryParams = keys
    .filter(key => mergedQuery[key] !== null && mergedQuery[key] !== undefined)
    .reduce((acc, key) => ({ ...acc, [key]: mergedQuery[key] }), {});

  return keys.length > 0 ? `?${querystring.stringify(newQueryParams)}` : '';
};

// BEGIN (write your solution here)
const prepareData = (data, headers) => {
  if (data === undefined) {
    return [data, headers];
  }
  const preparedData = querystring.stringify(data);
  const bufferData = Buffer.from(preparedData, 'utf-8');
  return [bufferData, {
    ...headers,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(bufferData),
  }];
};

export default (config) => {
  const [data, headers] = prepareData(config.data, config.headers || {});

  const urlObject = url.parse(config.url, true);
  const search = getSearch(urlObject.query, config.params);

  const options = {
    hostname: urlObject.hostname,
    port: urlObject.port,
    method: config.method,
    path: `${urlObject.pathname}${search}`,
    headers,
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
      };

      const responseData = [];
      res.on('data', (chunk) => {
        responseData.push(chunk.toString());
      });

      res.on('end', () => {
        try {
          response.data = responseData.join('');
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

// END

/* // solution.js

export const get = (url, config = {}) =>
  dispatch({ ...config, url, method: 'GET' });

export const post = (url, data, config = {}) =>
  dispatch({
    ...config, url, data, method: 'POST',
  });
*/
