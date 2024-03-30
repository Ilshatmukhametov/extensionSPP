chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    console.log('PORT_NAME', port.name, msg)
    switch(msg.name){
      case 'scrapy_main':
        scrapy_main(port, msg)
        break
      case 'fetched':
        fetched(port, msg)
    }
  })
})
const scrapy_main = (port) => {
  const head = document.getElementById('mainContainer')
  if (head == null) {
    port.postMessage('error')
    setTimeout(() => scrapy_main(port),100)
  } else {
    port.postMessage('found')
  }
}

const fetched = (port, msg) => {
  const head = document.getElementsByClassName('price-block__content')
  const soldOutCon = document.getElementsByClassName('sold-out-product')
  if (head[0] == null) {
    if (soldOutCon !== null) {
      renderWidget(soldOutCon, msg)
    } else {
      return true
    }
  } else {
    renderWidget(head, msg)
  }
}

const renderWidget = (head, msg) => {
  const existedComponent = document.getElementsByClassName('sppWidget')

  if (existedComponent[0] !== null) {
    Object.keys(existedComponent).forEach(el => {
      existedComponent[el].remove()
    })
  }
  Object.keys(head).forEach(el => {
    const adjacentHTML =
      `<div class="sppWidget">
            ${sppComponentRender(msg.response.product)}
            ${minMaxComponentRender(msg.response.ranges)}
      </div>`

    head[el].insertAdjacentHTML('beforebegin', adjacentHTML)
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