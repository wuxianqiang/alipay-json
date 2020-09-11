const request = require('request');
const url = 'https://developers.weixin.qq.com/miniprogram/dev/component/cover-view.html'
const fs = require('fs')

const keys = {
  '006ksj': 'scroll-view',
  '006ksa': 'view',
  '006kse': 'swiper',
  '006ksn': 'cover-view',
  '006ksq': 'cover-image',
  '006ksu': 'movable-view',
  '006ksy': 'movable-area',
  '006kt6': 'text',
  '006ktb': 'icon',
  '006ktf': 'progress',
  '006ktj': 'rich-text',
  '006kts': 'button',
  '006ktv': 'form',
  '006ku0': 'label',
  '006ku2': 'input',
  '006ku8': 'textarea',
  '006kub': 'radio',
  '006kug': 'radio-group',
  '006kuk': 'checkbox',
  '006kus': 'switch',
  '006kuw': 'slider',
  '006kv0': 'picker-view',
  '006kv3': 'picker',
  '006kvb': 'navigator',
  '006kvj': 'image',
  '006kvo': 'video',
  '019hzu': 'lottie',
  '006kvv': 'canvas',
  '006kw2': 'map',
  '006kwn': 'lifestyle',
  '006kws': 'contact-button',
  '006kwu': 'spread',
  '006kwm': 'web-view',
  '0185km': 'container',
  '0185kp': 'title',
  '0189b2': 'list',
  '0189b3': 'list-item',
  '018unk': 'list-secondary',
  '018unj': 'tabs',
  '018unl': 'vtabs',
  '018unm': 'card',
  '018unn': 'coupon',
  '018src': 'grid',
  '018srd': 'steps',
  '018sre': 'footer',
  '018srf': 'terms',
  '018uno': 'flex',
  '018unp': 'collapse',
  '018srg': 'popover',
  '018srh': 'filter',
  '018tp7': 'modal',
  '018tp8': 'popup',
  '018x2r': 'page-result',
  '018w2z': 'message',
  '018w30': 'tips',
  '018w31': 'wotice',
  '018x2t': 'badge',
  '018x2u': 'tag',
  '018x2v': 'mask',
  '018tp9': 'guide',
  '018x2w': 'avatar',
  '018x2x': 'input-item',
  '018w32': 'verify-code',
  '018w33': 'picker-item',
  '018x2y': 'long-password',
  '018tpa': 'multi-liner',
  '018tpb': 'amount-input',
  // '018w34': 'button',
  '018tpc': 'am-switch',
  '018x2z': 'search-bar',
  '018tpd': 'am-radio',
  '018x30': 'am-checkbox',
  '018x31': 'swipe-action',
  '018w35': 'pagination',
  '018tpe': 'calendar',
  '018w36': 'stepper',
  '018w37': 'am-icon',
  '018w38': 'alphabet',
  '018tpf': 'loading',
  '018srm': 'wheel',
  '018unu': 'fruit-slots',
  '018unv': 'scratch',
  '018unw': 'hiteggs',
  '018unx': 'diceroller',
  '018uny': 'flipdraw',
  '018unz': 'lock',
}

async function toJson () {
  let requestList = []
  for (const key in keys) {
    requestList.push(handleRequest(key, keys[key]))
  }
  let result = await Promise.all(requestList)
  fs.writeFileSync('pay.json', JSON.stringify(result))
  console.log('完成')
}

toJson()

function handleRequest (key, realKay) {
  return new Promise((resolve, reject) => {
    let url = formKeyToUrl(key)
    request(url, (err, response, body) => {
      if (err) {
        reject({})
      }
      let item = {}
      let html = JSON.parse(body).result.text
      let reg = /<table.*?>([\s\S]*?)<\/table>/
      let tbody = /<tbody.*?>([\s\S]*?)<\/tbody>/
      if (reg.test(html)) {
        let table = reg.exec(html)[1]
        let body = tbody.exec(table)[1]
        let tableList = formTableToJson(body)
        item.tableList = tableList
      }
      let descriptList = formPtoJson(html)
      item.descriptList = descriptList
      resolve({[realKay]: item})
    })
  })
}

function formKeyToUrl (key) {
  return `https://opendocs.alipay.com/api/content/${key}?_output_charset=utf-8&_input_charset=utf-8`
}

function formTableToJson (table) {
  let td = /<td.*?>([\s\S]*?)<\/td>/g
  let tr = /<tr.*?>([\s\S]*?)<\/tr>/g
  let result = {}
  let flag = false
  let title = []
  table.replace(tr, (...args) => {
    let list = []
    args[1].replace(td, (...args) => {
      let val = handleText(args[1])
      list.push(val)
    })
    if (!flag) {
      title = list
      flag = true
      return
    }
    let [t1 = '属性', t2 = '类型', t3 = '默认值', t4 = '描述', t5 = '最低版本'] = title
    let [
      attr = '',
      type = '',
      defaultValue = '',
      explain = '',
      edition = ''
    ] = list
    result[attr] = [
      `${t1.replace('\t', '')}：${attr}`,
      `${t2}：${type}`,
      `${t3}：${defaultValue}`,
      `${t4}：${explain}`,
      `${t5}：${edition}`
    ]
  })
  // console.log(result)
  return result
}

function formPtoJson (desc) {
  let tip = /<iframe.*?>[\s\S]*?<\/iframe>/
  let content = desc.split(tip)[0]
  let h = /<h\d.*?>[\s\S]*?<\/h\d>/
  let [res] = content.split(h)
  let p = /<p.*?>([\s\S]*?)<\/p>/g
  let descList = []
  res.replace(p, (...args) => {
    let val = handleText(args[1])
    if (val) {
      descList.push(val)
    }
  })
  return descList
}

function handleText (text) {
  text = text.replace('<span></span>', '')
  text = text.replace(/\n|\t|\n|\r/g, '')
  text = text.replace(/(&#x27;|&quot;)/g, '')
  text = text.replace(/&gt;/g, '>')
  let link = /<a.*?>([\s\S]*?)<\/a>/g
  let code = /<code.*?>([\s\S]*?)<\/code>/g
  text = text.replace(/<pre.*?>([\s\S]*?)<\/pre>/g, '')
  // let pre = /<pre.*?>([\s\S]*?)<\/pre>/g
  let strong = /<strong.*?>([\s\S]*?)<\/strong>/g
  let span = /<span.*?>([\s\S]*?)<\/span>/g
  let p = /<p.*?>([\s\S]*?)<\/p>/g
  if (link.test(text)) {
    text = text.replace(link, (...args) => {
      return args[1]
    })
  }
  if (code.test(text)) {
    text = text.replace(code, (...args) => {
      return `\`${args[1]}\``
    })
  }
  if (strong.test(text)) {
    text = text.replace(strong, (...args) => {
      return `**${args[1]}**`
    })
  }
  if (p.test(text)) {
    text = text.replace(p, (...args) => {
      return `${args[1]}`
    })
  }
  if (span.test(text)) {
    text = text.replace(span, (...args) => {
      return `${args[1]}`
    })
  }
  text = text.replace(/(<p.*?>|<\/p>)/g, '')
  // if (pre.test(text)) {
  //   text = text.replace(pre, (...args) => {
  //     return `${args[1]}`
  //   })
  // }
  return text
}