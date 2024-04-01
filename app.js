chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    console.log('PORT_NAME', port.name, msg)
    switch(msg.name){
      case 'scrapy_main':
        scrapy_main(port, msg)
        break
      case 'fetched': {
        fetched(port, msg, 0)
        break
      }
    }
  })
})
const scrapy_main = (port) => {
  const head = document.getElementsByClassName('price-block__content')
  const soldOutCon = document.getElementsByClassName('sold-out-product')
  if (head[0] !== null) {
    port.postMessage('start_fetching')
    isLoadingFunc(0, port)
  } else {
    port.postMessage('error')
    setTimeout(() => scrapy_main(port),100)
  }
}


const isLoadingFunc = (attempts,port) => {
  const head = document.getElementsByClassName('price-block__content')
  const soldOutCon = document.getElementsByClassName('sold-out-product')

  if (attempts < 5) {
    if (head[0] == null) {
      setTimeout(() => isLoadingFunc(attempts + 1, port), 200)
    } else {
      sceletonComponentRender(head)
    }
  } else {
    if (soldOutCon[0] == null) {
      return false
    } else {
      sceletonComponentRender(soldOutCon)
    }
  }
}

const fetched = (port, msg, attempts) => {
  const head = document.getElementsByClassName('price-block__content')
  const soldOutCon = document.getElementsByClassName('sold-out-product')

  if (attempts < 5) {
    port.postMessage(attempts)
    if (head[0] == null) {
      port.postMessage('Не найдены компоненты, ищу заново')
      setTimeout(() => fetched(port, msg, attempts + 1), 200)
    } else {
      renderWidget(head, msg, port)
    }
  } else {
    if (soldOutCon[0] == null) {
      port.postMessage('errors')
    } else {
      renderWidget(soldOutCon, msg, port)
    }
  }
}
const renderWidget = (head, msg, port) => {
  const existingSceleton = document.getElementsByClassName('sppSceleton')
  const existingComponent = document.getElementsByClassName('sppWidget')

  if (existingSceleton[0] !== null) {
    Object.keys(existingSceleton).forEach(el => {
      existingSceleton[el].style.cssText = 'display: none;'
    })
  }
  if (existingComponent[0] !== null) {
    Object.keys(existingComponent).forEach(el => {
      existingComponent[el].remove()
    })
  }

  Object.keys(head).forEach(el => {
    const adjacentHTML =
      `<div class="sppWidget">
            ${sppComponentRender(msg.response.product)}
            ${minMaxComponentRender(msg.response.ranges)}
      </div>`

    head[el].insertAdjacentHTML('beforeend', adjacentHTML)
    //
    // if (sceleton[0] !== null) {
    //   Object.keys(sceleton).forEach(el => {
    //     sceleton[el].style.cssText = 'display: none;'
    //   })
    // }
  })
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

const sceletonComponentRender = (head) => {

  Object.keys(head).forEach(el => {
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

    head[el].insertAdjacentHTML('beforeend', adjacentHTML)
    //
    // if (sceleton[0] !== null) {
    //   Object.keys(sceleton).forEach(el => {
    //     sceleton[el].style.cssText = 'display: none;'
    //   })
    // }
  })
}