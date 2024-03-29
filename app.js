const flex_row_gap = 'display: flex; flex-direction: row; gap: 4px;'
const flex_column_gap = 'display: flex; flex-direction: column; gap: 4px;'
const percents_container_css = 'padding: 4px 16px 4px 16px; background-color: #7986CB; color: white; border-radius: 8px; height: 25px; width: max-content;display:flex;align-items:center;min-width: 65px;'
const spp_percent_css = 'padding: 8px 16px 8px 16px; background-color: #3F51B5; color: white; border-radius: 8px; width: min-content; display: flex; flex-direction: column; min-width: 65px;'
const min_max_price_css = 'padding: 4px 16px 4px 16px; background-color: #7986CB; color: white; border-radius: 8px; height: 25px; width: 100%; display: flex; align-items:center;'
const seller_price_css = 'padding: 8px 16px 8px 16px; background-color: #3F51B5; color: white; border-radius: 8px; width: 100%; display: flex; flex-direction: column;'
const bold_span_css = 'width: max-content; font-size: 14px;font-weight: 700; color: white'
const normal_span_css = 'width: max-content; font-size: 12px;font-weight: 400; color: white'


chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    port.postMessage('scrapy')
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
const scrapy_main = (port, msg) => {
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
    const parentComponent = document.createElement('div')
    parentComponent.className = 'sppWidget'
    parentComponent.style.cssText = parent_container_css


    if (msg.response.product.length !== 0) {
      Object.keys(msg.response.product).forEach(elem => {
        const { price, discount, spp } = msg.response.product[elem]

        const sellerPrice = Math.floor(price - (price * (discount / 100)))

        const flexRow = document.createElement('div')
        const sppContainer = document.createElement('div')
        const sellerContainer = document.createElement('div')

        const normalSpanSpp = document.createElement('span')
        const boldSpanSpp = document.createElement('span')

        const normalSpanSeller = document.createElement('span')
        const boldSpanSeller = document.createElement('span')

        normalSpanSeller.textContent = 'Цена продавца'
        boldSpanSeller.textContent = `${ sellerPrice } ₽`

        normalSpanSpp.textContent = 'СПП'
        boldSpanSpp.textContent = `${ spp }%`

        sellerContainer.appendChild(boldSpanSeller)
        sellerContainer.appendChild(normalSpanSeller)

        sppContainer.appendChild(boldSpanSpp)
        sppContainer.appendChild(normalSpanSpp)

        flexRow.appendChild(sppContainer)
        flexRow.appendChild(sellerContainer)

        parentComponent.appendChild(flexRow)

        head[el].appendChild(parentComponent)
      })
    }
    else {
      const noneSppDiv = document.createElement('div')
      const noneSppSpan = document.createElement('span')
      noneSppSpan.style.cssText = normal_span_css
      noneSppDiv.style.cssText = spp_percent_css

      noneSppSpan.textContent = 'СПП не известна'
      noneSppDiv.appendChild(noneSppSpan)
      parentComponent.appendChild(noneSppDiv)

      head[el].appendChild(parentComponent)
    }

    if (msg.response.ranges.length !==0) {
      const flexColumnGap = document.createElement('div')
      const titleDiv = document.createElement('div')
      const titleSpan = document.createElement('span')

      titleDiv.style.cssText = min_max_price_css
      titleSpan.style.cssText = normal_span_css
      flexColumnGap.style.cssText = flex_column_gap

      titleSpan.textContent = 'СПП в Категории'

      titleDiv.appendChild(titleSpan)

      flexColumnGap.appendChild(titleDiv)


      parentComponent.appendChild(flexColumnGap)

      head[el].appendChild(parentComponent)

      Object.keys(msg.response.ranges).forEach(elem => {
        const { min, max, spp } = msg.response.ranges[elem]
        const flexRow = document.createElement('div')
        const sppContainer = document.createElement('div')
        const minMaxContainer = document.createElement('div')

        const spanSpp = document.createElement('span')
        const spanMinMax = document.createElement('span')

        flexRow.style.cssText = flex_row_gap
        sppContainer.style.cssText = percents_container_css
        minMaxContainer.style.cssText = min_max_price_css
        spanSpp.style.cssText = bold_span_css
        spanMinMax.style.cssText = bold_span_css

        spanSpp.textContent = `${spp}%`
        spanMinMax.textContent = `${min} ₽-${max} ₽`

        sppContainer.appendChild(spanSpp)
        minMaxContainer.appendChild(spanMinMax)

        flexRow.appendChild(sppContainer)
        flexRow.appendChild(minMaxContainer)

        parentComponent.appendChild(flexRow)

        head[el].appendChild(parentComponent)
      })
    }
  })
}