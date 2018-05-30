import url from 'url';
import http from 'http';

const getTitle = body => body.match(/<h1>(.*?)<\/h1>/)[1];
const getLinks = body =>
  (body.match(/href="\/(.*?)">/g) || [])
    .map(item => item.match(/href="\/(.*?)">/)[1]);

// BEGIN (write your solution here)
export default (expectedTitle, link, callback) => {
  const { protocol, pathname, host } = url.parse(link);
  const search = (waited, visited) => {
    if (waited.length === 0) {
      callback(new Error('link was not found'));
      return;
    }
    const [current, ...rest] = waited;
    const body = [];

    const address = url.format({ protocol, host, pathname: current });

    if (visited.has(current)) {
      search(rest, visited);
      return;
    }

    http.get(address, (res) => {
      res.on('data', (chunk) => {
        body.push(chunk.toString());
      }).on('end', () => {
        const data = body.join();
        const actualTitle = getTitle(data);
        if (expectedTitle === actualTitle) {
          callback(null, address);
          return;
        }
        const newLinks = getLinks(data);
        visited.add(current);
        search([...newLinks, ...rest], visited);
      });
    }).on('error', (e) => {
      callback(e);
    });
  };

  search([pathname], new Set());
};
// END
