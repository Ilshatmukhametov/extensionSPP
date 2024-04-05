chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    console.log('PORT_NAME', port.name, msg)
    switch(msg.name){
      case 'scrapy_main':
        scrapy_main(port, msg)
        break
      case 'unauthorized':
        unauthorizedUser()
        break
      case 'fetched':
        fetched(port, msg)
        break
    }
  })
})
const scrapy_main = (port) => {
  const head = document.getElementsByClassName('product-page__aside-sticky')

  if (head.length === 0) {
    setTimeout(() => scrapy_main(port), 100)
  } else {
    removeExistingComponent(port)
  }
}


const renderSppWidget = (port) => {
  const head = document.getElementsByClassName('product-page__aside-sticky')

  const widget = document.createElement('div')
  widget.className = 'sppExtensionWidget'

  head[0].insertBefore(widget, document.getElementsByClassName('product-page__aside-container')[0])
  sceletonComponentRender(port)
}

const fetched = (port, msg) => {
  const mainDiv = document.getElementsByClassName('sppExtensionWidget')
  renderWidget(mainDiv, msg)
}
const renderWidget = (head, msg) => {
  const existingSceleton = document.getElementsByClassName('sppSceleton')

  existingSceleton[0].remove()

  const adjacentHTML =
    `<div class="sppWidget">
          ${sppComponentRender(msg.response.product)}
          ${minMaxComponentRender(msg.response.ranges)}
    </div>`

  head[0].insertAdjacentHTML('beforeend', adjacentHTML)
}


const sppComponentRender = (product) => {
  let innerHtml = ''
  if (product.length > 0 ) {
    product.forEach(el => {
      const { spp, discount, price } = el
      const sellerPrice = Math.floor(price - (price * (discount / 100)))
      innerHtml +=
        '      <div class="sppPriceContainer">\n' +
        '\n' +
        '        <div class="sppContainer">\n' +
        `          <span>${spp}%</span>\n` +
        '          <span>СПП</span>\n' +
        '        </div>\n' +
        '\n' +
        '        <div class="priceContainer">\n' +
        `          <span>${sellerPrice} ₽</span>\n` +
        '          <span>Цена продавца</span>\n' +
        '        </div>\n' +
        '\n' +
        '      </div>'
    })
  } else {
    innerHtml = '    ' +
      '<div class="emptySppContainer">\n' +
      '      СПП не известна\n' +
      '</div>'
  }
  return innerHtml
}

const minMaxComponentRender = (ranges) => {
  let innerHtml = '<div class="rangesTitle">СПП в Категории</div>'

  if (ranges.length > 0) {
    ranges.forEach(el => {
      const { min, max, spp } = el

      innerHtml += '      ' +
        '     <div class="minMaxContainer">\n' +
        `          <div class="minMaxPercents">${spp}%</div>\n` +
        `          <div class="minMaxPrice">${min} ₽-${max} ₽</div>\n` +
        '     </div>\n'
    })
  } else {
    innerHtml = '</>'
  }
  return innerHtml
}

const sceletonComponentRender = (port) => {
  const mainDiv = document.getElementsByClassName('sppExtensionWidget')
  port.postMessage('start_fetching')

  const adjacentHTML =
    '<div class="sppSceleton">' +
      '<div class="flexRow">' +
        '<div class="pulsate1"></div>' +
        '<div class="pulsate2"></div>' +
      '</div>' +
      '<div class="pulsate3"></div>' +
      '<div class="flexRow">' +
        '<div class="pulsate4"></div>' +
        '<div class="pulsate5"></div>' +
      '</div>' +
      '<div class="flexRow">' +
        '<div class="pulsate6"></div>' +
        '<div class="pulsate7"></div>' +
      '</div>' +
    '</div>'

  mainDiv[0].insertAdjacentHTML('beforeend', adjacentHTML)
}

const unauthorizedUser = () => {
  renderAuthComponent()
}

const renderAuthComponent = () => {
  const sppWidget = document.getElementsByClassName('sppExtensionWidget')
  const existingSceleton = document.getElementsByClassName('sppSceleton')
  const urlLink = document.createElement('a')
  urlLink.target = '_parent'
  urlLink.href = 'https://wbspp.oiseller.ru'

  const authImage = document.createElement('img');
  authImage.src = chrome.runtime.getURL("images/authImage.svg");

  existingSceleton[0].remove()

  urlLink.appendChild(authImage)
  sppWidget[0].appendChild(urlLink)

}

const removeExistingComponent = (port) => {
  const existingDiv = document.getElementsByClassName('sppExtensionWidget')

  if (existingDiv.length !== 0) {
    Object.keys(existingDiv).forEach(el => {
      existingDiv[el].remove()
    })
  }

  renderSppWidget(port)
}

