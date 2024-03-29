const operation__scrapy_main = 'scrapy_main'
let url_cache


chrome.webNavigation.onCompleted.addListener(  function (e) {
  url_cache = ''
}, {
  url: [
    {urlPrefix: 'https://www.wildberries.ru/catalog'},
  ]
});

const connect = (listEvent) => {
  const listEventPathname = new URL(listEvent.url).pathname

  if (listEventPathname !== url_cache) {
    console.log(listEventPathname)
    let port = chrome.tabs.connect(listEvent.tabId)
    port.postMessage({ name: operation__scrapy_main })
    port.onMessage.addListener(function (msg) {
      if (msg === 'found') {
        fetchSpp(listEvent.url, port)
      }
    })
    port.onDisconnect.addListener(function (port) {
      if (chrome.runtime.lastError) {
        let msg = chrome.runtime.lastError.message
        console.log('error', msg)
      }
    })
  }

  url_cache = listEventPathname
}

chrome.webNavigation.onHistoryStateUpdated.addListener((listEvent) => connect(listEvent), {
  url: [
    {urlPrefix: 'https://www.wildberries.ru/catalog'},
  ]
});


const fetchSpp = async (url, port) => {
  const nmid = new URL(url).pathname.split('/')[2]

  if (!isNaN(nmid)) {
  try {
    const response = await fetch('http://37.230.113.58:9003/spp?' + new URLSearchParams({ nmid })
    ).then(res => res.json());
    port.postMessage({ name: 'fetched', response })
  } catch (error) {
    console.error(error);
  }
  }
}