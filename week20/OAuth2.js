/**
 * publish-tool 唤起 authURI
 * publish-server 获取 access_token
 */

{
  let state = 'abc123';
  let client_id = 'Iv1.ab67a7893d5befda';
  let client_secret = '8a34d7d7ca32c39f47d878d63235ed6c5406cbfb';
  let redirect_uri = encodeURIComponent('http://localhost:8000');

  /** 
   * TODO: 1 客户端-浏览器 pubulish-tool
   */
  let authURI = `https://github.com/login/oauth/authorize?client_id=Iv1.ab67a7893d5befda&redirect_uri=${encodeURIComponent('http://localhost:8000')}`

  /**
   * TODO: 2 服务器 publish-server
   */
  let code = '191982a60dc6dbda7a91';
  let params = `code=${code}&state=${state}&client_secret=${client_secret}&client_id=${client_id}&redirect_uri=${redirect_uri}`;

  let xhr = new XMLHttpRequest;

  xhr.open('POST', `https://github.com/login/oauth/access_token?${params}`, true);
  xhr.send(null);

  xhr.addEventListener('readystatechange', function (event) {
    if (xhr.readyState === 4) {
      // debugger;
      console.log(xhr.responseText);
    }
  })
}

/**
 * TODO: 3 客户端/服务器 publish-tool/publish-server
 */
{
  let token = '78e716c8442802be3385a420f70a75c8c2070b47';
  xhr.open('GET', `https://api.github.com/user`, true);
  xhr.setRequestHeader('Authorization', `token ${token}`)
  xhr.send(null);

  xhr.addEventListener('readystatechange', function (event) {
    if (xhr.readyState === 4) {
      // debugger;
      console.log(xhr.responseText);
    }
  })
}