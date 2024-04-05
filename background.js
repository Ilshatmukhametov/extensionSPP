const operation__scrapy_main = 'scrapy_main'
let url_cache

chrome.webNavigation.onDOMContentLoaded.addListener(  function () {
  url_cache = ''
}, {
  url: [
    {urlPrefix: 'https://www.wildberries.ru/catalog'},
  ]
});

const urlCheck = (listEvent) => {
  const listEventPathname = new URL(listEvent.url).pathname

  if (listEventPathname !== url_cache) {
    connectionHandler(listEvent)
  }

  url_cache = listEventPathname
}

chrome.webNavigation.onHistoryStateUpdated.addListener((listEvent) => urlCheck(listEvent), {
  url: [
    {urlPrefix: 'https://www.wildberries.ru/catalog'},
  ]
});


const fetchingSpp = async (url, port) => {
  const nmid = new URL(url).pathname.split('/')[2]

  if (!isNaN(nmid)) {
    try {
      const response = await fetch('https://wbspp.oiseller.ru/spp?' + new URLSearchParams({ nmid }))
      const responseJson = await response.json()
      const currentNmid = url_cache.split('/')[2]
      if (response.status !== 401) {
        if (currentNmid == nmid) {
          port.postMessage({ name: 'fetched', response: responseJson })
        }
      } else {
        port.postMessage({ name: 'unauthorized' })
      }
    } catch (error) {
      console.error(error);
    }
  }
}

const connectionHandler = (listEvent) => {
  let port = chrome.tabs.connect(listEvent.tabId)
  port.postMessage({ name: operation__scrapy_main })

  port.onMessage.addListener(function (msg) {
    if (msg === 'start_fetching') {
      fetchingSpp(listEvent.url, port)
    }
  })

  port.onDisconnect.addListener(function (port) { onDisconnectListener(listEvent, port) })
}


const onDisconnectListener = (listEvent, port) => {
  const lastError = chrome.runtime.lastError;

  port.onDisconnect.removeListener(onDisconnectListener);

  if (lastError) {
    setTimeout(() => connectionHandler(listEvent), 200);
  }
}