// ============================================================
// Mihomo 覆写脚本（自维护仓库 clash-rules）
// 版本：2026-11-19
// 本版改动（对比原始模板）：
//   1. 新增「应用专项拦截」APP_AD_RULES：红果短剧穿山甲广告（仅对该 App 生效）
//   2. 新增 anti-AD 规则集，与 category-ads 一起前置到 cn 直连规则之前
//   3. 自动选择 / 负载均衡 / 国家组排除注入的「直连」伪节点，避免自动组选出直连
//   4. 修复 NODE_FILTER_* 中写坏的量词 [A-Za-z]{2|} → [A-Za-z]{1,2}
//   5. FCM 不再默认直连（国内直连 mtalk 不通，默认走手动选择）
// 维护说明见仓库 README.md
// ============================================================

var TEST_URL = 'https://www.apple.com/library/test/success.html'
var ICON_BASE = 'https://cdn.jsdmirror.com/gh/AIsouler/MyClash@main/Icons/svg/'
var OASIS_ICON = 'https://raw.githubusercontent.com/Hawaiine/Oasisic-Icons/main/icons/'
var BETT_GEO = 'https://cdn.jsdmirror.com/gh/appshubcc/bett-rules@meta/geo'

var FILTER_HK = String.raw`(?i)(🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\s*kong)`
var FILTER_JP = String.raw`(?i)(🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan)`
var FILTER_US = String.raw`(?i)(🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\s*states)`
var FILTER_SG = String.raw`(?i)(🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore)`
var FILTER_TW = String.raw`(?i)(🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan)`

var NODE_FILTER_HK = String.raw`🇭🇰|港|\bHK(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|hk|Hong Kong|HongKong|hongkong|HONG KONG|HONGKONG|深港|HKG|九龙|Kowloon|新界|沙田|荃湾|葵涌`
var NODE_FILTER_US = String.raw`🇺🇸|美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|纽约|纽纽|亚特兰大|迈阿密|华盛顿|\bUS(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|United States|UnitedStates|UNITED STATES|USA|America|AMERICA|JFK|EWR|IAD|ATL|ORD|MIA|NYC|LAX|SFO|SEA|DFW|SJC`
var NODE_FILTER_JP = String.raw`🇯🇵|日本|川日|东京|大阪|泉日|埼玉|沪日|深日|(?<!尼|-)日|\bJP(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Japan|JAPAN|JPN|NRT|HND|KIX|TYO|OSA|关西|Kansai|KANSAI`
var NODE_FILTER_SG = String.raw`🇸🇬|新加坡|坡|狮城|\bSG(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Singapore|SINGAPORE|SIN`
var NODE_FILTER_TW = String.raw`🇹🇼|🇼🇸|台|新北|彰化|\bTW(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Taiwan|TAIWAN|TWN|TPE|ROC`
var NODE_FILTER_KR = String.raw`🇰🇷|\bKR(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Korea|KOREA|KOR|首尔|韩|韓|春川|Chuncheon|ICN`
var NODE_FILTER_CA = String.raw`🇨🇦|加拿大|\bCA(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Canada|CANADA|CAN|渥太华|温哥华|卡尔加里|蒙特利尔|Montreal|YVR|YYZ|YUL`
var NODE_FILTER_UK = String.raw`🇬🇧|英国|Britain|United Kingdom|UNITED KINGDOM|England|伦敦|曼彻斯特|Manchester|\bUK(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|GBR|LHR|MAN`
var NODE_FILTER_FR = String.raw`🇫🇷|法国|\bFR(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|France|FRANCE|FRA|巴黎|马赛|Marseille|CDG|MRS`
var NODE_FILTER_DE = String.raw`🇩🇪|德国|Germany|GERMANY|\bDE(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|DEU|柏林|法兰克福|慕尼黑|Munich|MUC`
var NODE_FILTER_NL = String.raw`🇳🇱|荷兰|Netherlands|NETHERLANDS|\bNL(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|NLD|阿姆斯特丹|AMS`
var NODE_FILTER_TR = String.raw`🇹🇷|土耳其|Turkey|TURKEY|Türkiye|\bTR(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|TUR|IST|ANK`
var NODE_FILTER_OTHER = String.raw`(^(?!.*(港|\bHK(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|hk|Hong Kong|HongKong|hongkong|HONG KONG|HONGKONG|深港|HKG|🇭🇰|九龙|Kowloon|新界|沙田|荃湾|葵涌|美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|纽约|纽纽|亚特兰大|迈阿密|华盛顿|\bUS(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|United States|UnitedStates|UNITED STATES|USA|America|AMERICA|JFK|EWR|IAD|ATL|ORD|MIA|NYC|LAX|SFO|SEA|DFW|SJC|🇺🇸|日本|川日|东京|大阪|泉日|埼玉|沪日|深日|(?<!尼|-)日|\bJP(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Japan|JAPAN|JPN|NRT|HND|KIX|TYO|OSA|🇯🇵|关西|Kansai|KANSAI|新加坡|坡|狮城|\bSG(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Singapore|SINGAPORE|SIN|🇸🇬|台|新北|彰化|\bTW(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Taiwan|TAIWAN|TWN|TPE|ROC|🇹🇼|\bKR(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Korea|KOREA|KOR|首尔|韩|韓|春川|Chuncheon|ICN|🇰🇷|加拿大|\bCA(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|Canada|CANADA|CAN|渥太华|温哥华|卡尔加里|蒙特利尔|Montreal|YVR|YYZ|YUL|🇨🇦|英国|Britain|United Kingdom|UNITED KINGDOM|England|伦敦|曼彻斯特|Manchester|\bUK(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|GBR|LHR|MAN|🇬🇧|法国|\bFR(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|France|FRANCE|FRA|巴黎|马赛|Marseille|CDG|MRS|🇫🇷|德国|Germany|GERMANY|\bDE(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|DEU|柏林|法兰克福|慕尼黑|Munich|MUC|🇩🇪|荷兰|Netherlands|NETHERLANDS|\bNL(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|NLD|阿姆斯特丹|AMS|🇳🇱|土耳其|Turkey|TURKEY|Türkiye|\bTR(?:[-_ ]?\d+(?:[-_ ]?[A-Za-z]{1,2})?)?\b|TUR|IST|ANK|🇹🇷)).*)`

var FILTER_JUNK = String.raw`(?i)(群|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|电报|频道|无法|说明|提示|访问|支持|教程|关注|更新|作者|加入|超时|收藏|优惠|福利|邀请|好友|失联|选择|剩余|公益|发布|DIZTNA|通路|登录|定时|渠道|牢记|永久|余额|阁下|本站|刷新|导航|建议|重置|以下|过滤|⚠️|@|t\.me\/\+|\bexpire\b|\bhttps?:\/\/|\.com|\btraffic\b)`

var ENABLE_JUNK_FILTER = true

var BASE_SETTINGS = {
  'mixed-port': 7890,
  'allow-lan': true,
  'bind-address': '*',
  ipv6: true,
  mode: 'rule',
  'log-level': 'info',
  'unified-delay': true,
  'tcp-concurrent': true,
  'keep-alive-interval': 60,
  'find-process-mode': 'strict'
}

var DIRECT_PROXIES = [
  { name: '🇨🇳 直连 | 双栈', type: 'direct' },
  { name: '🇨🇳 直连 | IPv4优先', type: 'direct', 'ip-version': 'ipv4-prefer' },
  { name: '🇨🇳 直连 | IPv6优先', type: 'direct', 'ip-version': 'ipv6-prefer' },
  { name: '🇨🇳 直连 | 仅IPv4', type: 'direct', 'ip-version': 'ipv4' },
  { name: '🇨🇳 直连 | 仅IPv6', type: 'direct', 'ip-version': 'ipv6' }
]

// 自动类分组要排除的节点名关键词（注入的直连伪节点名字都含「直连」）
var DIRECT_NODE_MARK = '直连'

var CUSTOM_GROUP = '自定义'
var CUSTOM_DIRECT_IPS = []
var CUSTOM_DIRECT_DOMAINS = []

// 广告拦截白名单：被 anti-AD / category-ads 误伤的域名填这里（裸域名，按后缀匹配直连放行）
// 例：'example.com'
var AD_WHITELIST_DOMAINS = []

// 应用专项拦截规则：排在所有规则最前面（在 cn 直连规则之前，否则会被直连先放行）
// 新增某个 App 的专项拦截时往这个数组里加，格式与 RULES 相同
var APP_AD_RULES = [
  // 红果短剧（com.phoenix.read）：广告走字节穿山甲 SDK，仅对该 App 生效，不误伤其他应用
  //   pangolin 关键词   → 覆盖 pangolin-sdk-toutiao / pangolin-dsp-toutiao 全家族（开屏、插播广告下发）
  //   pglstatp-toutiao  → 穿山甲广告素材 CDN
  //   -ad-sign.byteimg  → 广告素材签名域（p3/p6/p9-ad-sign.byteimg.com）；注意 byteimg 整域是正片图床，不能拦
  //   zlink.ugsdk.cn    → 广告落地页跳转
  // 注意：拦截后「看广告得金币 / 解锁集数」的激励广告会加载失败；红果自家 API 下发的广告
  //      （*.snssdk.com 路径带 /api/ad/）域名层拦不了，不要整域拦 snssdk/zijieapi/fqnovel，正片会一起死
  'AND,((PROCESS-NAME,com.phoenix.read),(OR,((DOMAIN-KEYWORD,pangolin),(DOMAIN-SUFFIX,pglstatp-toutiao.com),(DOMAIN-SUFFIX,pglstatp-toutiao-b.com),(DOMAIN-KEYWORD,-ad-sign.byteimg.com),(DOMAIN,zlink.ugsdk.cn)))),REJECT'
]

var SELECT_BASE = {
  type: 'select',
  interval: 600,
  timeout: 3000,
  'max-failed-times': 3,
  'empty-fallback': 'REJECT',
  url: TEST_URL,
  lazy: true
}

var MEMBERS_BASE = ['手动选择', '自动选择', '负载均衡']
var MEMBERS_REGIONS = ['香港', '日本', '美国', '新加坡', '台湾']

var SERVICE_GROUPS = [
  { name: 'FCM', icon: 'Fcm.svg', direct: true },
  { name: 'YouTube', icon: 'YouTube.svg' },
  { name: 'Google', icon: 'Google.svg' },
  { name: 'AI', icon: 'OpenAI.svg' },
  { name: 'GitHub', icon: 'GitHub.svg' },
  { name: 'Microsoft', icon: 'Microsoft.svg', direct: true },
  { name: 'Apple', icon: 'Apple.svg', direct: true },
  { name: 'Telegram', icon: 'Telegram.svg' },
  { name: 'Steam', icon: 'Steam.svg', direct: true },
  { name: 'TikTok', icon: 'TikTok.svg' },
  { name: 'Twitter', icon: 'Twitter.svg' },
  { name: 'Meta', icon: 'Meta.svg' },
  { name: 'Line', icon: 'Line.svg' },
  { name: 'Netflix', icon: 'Netflix.svg' },
  { name: 'Emby', icon: 'Emby.svg', direct: true },
  { name: 'PikPak', icon: 'PikPak.svg', direct: true },
  { name: 'Spotify', icon: 'Spotify.svg', direct: true },
  { name: 'Crypto', icon: 'Bitcoin.svg' },
  { name: 'PayPal', icon: 'PayPal.svg' },
  { name: 'Patreon', icon: 'Patreon.svg' },
  { name: 'EHentai', icon: 'EHentai.svg', direct: true }
]

var MAIN_REGIONS = [
  { name: '香港', filter: FILTER_HK, icon: 'HongKong.svg' },
  { name: '日本', filter: FILTER_JP, icon: 'Japan.svg' },
  { name: '美国', filter: FILTER_US, icon: 'America.svg' },
  { name: '新加坡', filter: FILTER_SG, icon: 'Singapore.svg' },
  { name: '台湾', filter: FILTER_TW, icon: 'Taiwan.svg' }
]

var COUNTRY_GROUPS = [
  { name: '香港节点', filter: NODE_FILTER_HK, icon: OASIS_ICON + 'Country/HongKong/HongKong.png' },
  { name: '美国节点', filter: NODE_FILTER_US, icon: OASIS_ICON + 'Country/US/US.png' },
  { name: '日本节点', filter: NODE_FILTER_JP, icon: OASIS_ICON + 'Country/Japan/Japan.png' },
  { name: '新加坡节点', filter: NODE_FILTER_SG, icon: OASIS_ICON + 'Country/Singapore/Singapore.png' },
  { name: '台湾节点', filter: NODE_FILTER_TW, icon: OASIS_ICON + 'Country/CN-Taiwan/CN-Taiwan.png' },
  { name: '韩国节点', filter: NODE_FILTER_KR, icon: OASIS_ICON + 'Country/Korea/Korea.png' },
  { name: '加拿大节点', filter: NODE_FILTER_CA, icon: OASIS_ICON + 'Country/Canada/Canada.png' },
  { name: '英国节点', filter: NODE_FILTER_UK, icon: OASIS_ICON + 'Country/UK/UK.png' },
  { name: '法国节点', filter: NODE_FILTER_FR, icon: OASIS_ICON + 'System/Proxy/Proxy.png' },
  { name: '德国节点', filter: NODE_FILTER_DE, icon: OASIS_ICON + 'Country/Germany/Germany.png' },
  { name: '荷兰节点', filter: NODE_FILTER_NL, icon: OASIS_ICON + 'Country/Netherlands/Netherlands.png' },
  { name: '土耳其节点', filter: NODE_FILTER_TR, icon: OASIS_ICON + 'Country/Turkey/Turkey.png' },
  { name: '其他地区', filter: NODE_FILTER_OTHER, icon: OASIS_ICON + 'System/Final/Final.png' }
]

function makeSelect(name, proxies, extra) {
  var group = {}
  for (var k in SELECT_BASE) group[k] = SELECT_BASE[k]
  group.name = name
  group.proxies = proxies || []
  if (extra) for (var e in extra) group[e] = extra[e]
  return group
}

function includeSources(providerNames, extra) {
  var out = { 'include-all-proxies': true }
  if (providerNames && providerNames.length > 0) out.use = providerNames.slice(0)
  if (extra) for (var k in extra) out[k] = extra[k]
  return out
}

function makeUrlTest(name, filter, icon, providerNames, extra) {
  var base = includeSources(providerNames, extra)
  if (filter) base.filter = filter
  var group = makeSelect(name, [], base)
  group.type = 'url-test'
  group.tolerance = 50
  group.hidden = true
  if (icon) group.icon = icon
  return group
}

function buildProxyGroups(providerNames) {
  var groups = []
  var i
  var j
  var c

  groups.push(makeSelect('手动选择', [], includeSources(providerNames, {
    icon: ICON_BASE + 'Static.svg'
  })))

  // 自动选择 / 负载均衡：排除注入的直连伪节点，否则测速可能选出直连（苹果测速页国内有 CDN，直连延迟反而低）
  groups.push(makeSelect('自动选择', [], includeSources(providerNames, {
    type: 'url-test',
    tolerance: 50,
    hidden: true,
    'exclude-filter': DIRECT_NODE_MARK,
    icon: ICON_BASE + 'Auto.svg'
  })))

  groups.push(makeSelect('负载均衡', [], includeSources(providerNames, {
    type: 'load-balance',
    strategy: 'sticky-sessions',
    hidden: true,
    'exclude-filter': DIRECT_NODE_MARK,
    icon: ICON_BASE + 'RoundRobin.svg'
  })))

  for (i = 0; i < SERVICE_GROUPS.length; i++) {
    var svc = SERVICE_GROUPS[i]
    var members = MEMBERS_BASE.slice(0)
    if (svc.direct) members.push('直连')
    for (j = 0; j < MEMBERS_REGIONS.length; j++) members.push(MEMBERS_REGIONS[j])

    var extra = { icon: ICON_BASE + svc.icon }
    if (svc.selected) extra['default-selected'] = svc.selected
    groups.push(makeSelect(svc.name, members, extra))
  }

  groups.push(makeSelect('AdBlock', ['REJECT', 'DIRECT', 'REJECT-DROP', 'PASS'], {
    icon: ICON_BASE + 'AdBlock.svg'
  }))

  groups.push(makeSelect('漏网之鱼', ['手动选择', '直连'], {
    icon: ICON_BASE + 'Stack.svg'
  }))

  groups.push(makeSelect('直连', [
    '🇨🇳 直连 | 双栈',
    '🇨🇳 直连 | IPv4优先',
    '🇨🇳 直连 | IPv6优先',
    '🇨🇳 直连 | 仅IPv4',
    '🇨🇳 直连 | 仅IPv6'
  ], { icon: ICON_BASE + 'China.svg' }))

  groups.push(makeSelect(CUSTOM_GROUP, [
    '直连',
    '手动选择',
    '自动选择',
    '负载均衡',
    '香港',
    '日本',
    '美国',
    '新加坡',
    '台湾'
  ], { icon: ICON_BASE + 'Proxy.svg', 'default-selected': '直连' }))

  for (i = 0; i < MAIN_REGIONS.length; i++) {
    var region = MAIN_REGIONS[i]
    groups.push(makeSelect(region.name, [region.name + '-自动选择'], includeSources(providerNames, {
      filter: region.filter,
      icon: ICON_BASE + region.icon
    })))
    groups.push(makeUrlTest(region.name + '-自动选择', region.filter, ICON_BASE + 'Auto.svg', providerNames))
  }

  for (c = 0; c < COUNTRY_GROUPS.length; c++) {
    var country = COUNTRY_GROUPS[c]
    var countryGroup = includeSources(providerNames, {
      name: country.name,
      type: 'url-test',
      filter: country.filter,
      'exclude-filter': DIRECT_NODE_MARK,
      url: 'https://www.gstatic.com/generate_204',
      interval: 300,
      tolerance: 50,
      icon: country.icon
    })
    countryGroup.proxies = []
    groups.push(countryGroup)
  }

  return groups
}

var BETT_PROVIDERS = [
  ['private', 'domain', 'private'],
  ['private_ip', 'ipcidr', 'private'],
  ['games_cn', 'domain', 'category-games@cn'],
  ['nvidia_cn', 'domain', 'nvidia@cn'],
  ['apple_cn', 'domain', 'apple@cn'],
  ['microsoft_cn', 'domain', 'microsoft@cn'],
  ['geolocation-cn', 'domain', 'geolocation-cn'],
  ['cn_ip', 'ipcidr', 'cn'],
  ['googlefcm', 'domain', 'googlefcm'],
  ['youtube', 'domain', 'youtube'],
  ['google', 'domain', 'google'],
  ['google_ip', 'ipcidr', 'google'],
  ['ai', 'domain', 'category-ai-!cn'],
  ['github', 'domain', 'github'],
  ['microsoft', 'domain', 'microsoft'],
  ['microsoft_ip', 'ipcidr', 'microsoft'],
  ['apple', 'domain', 'apple'],
  ['apple_ip', 'ipcidr', 'apple'],
  ['telegram', 'domain', 'telegram'],
  ['telegram_ip', 'ipcidr', 'telegram'],
  ['steam', 'domain', 'steam'],
  ['steam_ip', 'ipcidr', 'steam'],
  ['tiktok', 'domain', 'tiktok'],
  ['tiktok_ip', 'ipcidr', 'tiktok'],
  ['twitter', 'domain', 'twitter'],
  ['twitter_ip', 'ipcidr', 'twitter'],
  ['meta', 'domain', 'meta'],
  ['facebook_ip', 'ipcidr', 'facebook'],
  ['line', 'domain', 'line'],
  ['netflix', 'domain', 'netflix'],
  ['netflix_ip', 'ipcidr', 'netflix'],
  ['pikpak', 'domain', 'pikpak'],
  ['spotify', 'domain', 'spotify'],
  ['spotify_ip', 'ipcidr', 'spotify'],
  ['cryptocurrency', 'domain', 'category-cryptocurrency'],
  ['paypal', 'domain', 'paypal'],
  ['patreon', 'domain', 'patreon'],
  ['ehentai', 'domain', 'ehentai'],
  ['geolocation-!cn', 'domain', 'geolocation-!cn'],
  ['category-ads', 'domain', 'category-ads'],
  ['fakeip_filter', 'domain', 'fakeip-filter'],
  ['cn', 'domain', 'cn'],
  ['douyin', 'domain', 'douyin']
]

function makeBettProvider(name, behavior, file) {
  var dir = behavior === 'ipcidr' ? 'geoip' : 'geosite'
  return {
    type: 'http',
    format: 'mrs',
    interval: 86400,
    behavior: behavior,
    url: BETT_GEO + '/' + dir + '/' + file + '.mrs',
    path: './ruleset/' + name + '.mrs',
    'path-in-bundle': 'geo/' + dir + '/' + file + '.mrs'
  }
}

var RULE_PROVIDERS = {}
for (var bp = 0; bp < BETT_PROVIDERS.length; bp++) {
  var item = BETT_PROVIDERS[bp]
  RULE_PROVIDERS[item[0]] = makeBettProvider(item[0], item[1], item[2])
}

RULE_PROVIDERS.emby = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'domain',
  url: 'https://cdn.jsdmirror.com/gh/666OS/rules@release/mihomo/domain/Emby.mrs',
  path: './ruleset/emby.mrs',
  'path-in-bundle': 'geo/geosite/category-emby.mrs'
}

RULE_PROVIDERS.emos = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'domain',
  url: 'https://cdn.jsdmirror.com/gh/binaryu/emos-proxy-rule@main/rules/emos-mihomo.mrs',
  path: './ruleset/emos.mrs',
  'path-in-bundle': 'geo/geosite/category-emby.mrs'
}

RULE_PROVIDERS.cn_additional = {
  type: 'http',
  format: 'mrs',
  interval: 86400,
  behavior: 'domain',
  url: 'https://static-file-global.353355.xyz/rules/cn-additional-list.mrs',
  path: './ruleset/cn_additional.mrs',
  'path-in-bundle': 'geo/geosite/cn.mrs'
}

// anti-AD：中文区广告/跟踪域名大表（privacy-protection-tools 维护），补 category-ads 对国内 App 覆盖不足
// 官方 clash.yaml 格式，任何 mihomo 版本可用；误伤时把域名填进 AD_WHITELIST_DOMAINS
RULE_PROVIDERS.anti_ad = {
  type: 'http',
  format: 'yaml',
  interval: 86400,
  behavior: 'domain',
  url: 'https://anti-ad.net/clash.yaml',
  path: './ruleset/anti_ad.yaml'
}

var DNS = {
  enable: true,
  ipv6: true,
  'use-hosts': true,
  'cache-algorithm': 'arc',
  'use-system-hosts': true,
  'enhanced-mode': 'fake-ip',
  'fake-ip-range': '198.18.0.1/15',
  'fake-ip-range6': '2001:2::1/48',
  'fake-ip-filter-mode': 'blacklist',
  'fake-ip-filter': [
    'rule-set:private',
    'rule-set:fakeip_filter',
    'rule-set:geolocation-cn',
    'rule-set:cn',
    'rule-set:googlefcm',
    'localhost',
    '*.lan',
    '*.local',
    '*.arpa',
    'time.apple.com',
    '+.pool.ntp.org',
    '+.msftconnecttest.com',
    '+.msftncsi.com',
    '+.pub.3gppnetwork.org',
    'localhost.ptlogin2.qq.com',
    'localhost.sec.qq.com',
    'localhost.*.weixin.qq.com',
    'id6.me',
    'open.e.189.cn',
    'hmrz.wo.cn',
    'nishub1.10010.com',
    'enrichgw.10010.com',
    '*.cmpassport.com',
    '*.wosms.cn'
  ],
  'default-nameserver': [
    'tls://223.5.5.5#DIRECT',
    'https://1.12.12.12/dns-query#DIRECT'
  ],
  'proxy-server-nameserver': [
    'tls://223.5.5.5#DIRECT',
    'https://doh.pub/dns-query#DIRECT'
  ],
  nameserver: [
    'https://cloudflare-dns.com/dns-query#手动选择',
    'https://dns.google/dns-query#手动选择'
  ],
  'nameserver-policy': {
    'rule-set:private': 'system',
    'rule-set:douyin': ['system', '180.184.1.1', '180.184.2.2'],
    'rule-set:cn': ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT']
  },
  'direct-nameserver': ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT'],
  'direct-nameserver-follow-policy': true
}

var HOSTS = {
  'doh.pub': ['1.12.12.12', '120.53.53.53'],
  'cloudflare-dns.com': ['1.1.1.1', '1.0.0.1'],
  'dns.google': ['8.8.8.8', '8.8.4.4'],
  'services.googleapis.cn': 'services.googleapis.com',
  '+.mcdn.bilivideo.com': ['0.0.0.0'],
  '+.mcdn.bilivideo.cn': ['0.0.0.0'],
  '+.edge.mountaintoys.cn': ['0.0.0.0'],
  '+.h2.smtcdns.net': ['0.0.0.0']
}

function buildCustomRules() {
  var rules = []
  var i
  var ip
  var domain
  for (i = 0; i < CUSTOM_DIRECT_IPS.length; i++) {
    ip = CUSTOM_DIRECT_IPS[i]
    if (!ip) continue
    rules.push('IP-CIDR,' + ip + (String(ip).indexOf('/') >= 0 ? '' : '/32') + ',' + CUSTOM_GROUP + ',no-resolve')
  }
  for (i = 0; i < CUSTOM_DIRECT_DOMAINS.length; i++) {
    domain = CUSTOM_DIRECT_DOMAINS[i]
    if (!domain) continue
    rules.push('DOMAIN-SUFFIX,' + domain + ',' + CUSTOM_GROUP)
  }
  return rules
}

function buildAdWhitelistRules() {
  var rules = []
  for (var i = 0; i < AD_WHITELIST_DOMAINS.length; i++) {
    var d = AD_WHITELIST_DOMAINS[i]
    if (!d) continue
    rules.push('DOMAIN-SUFFIX,' + d + ',直连')
  }
  return rules
}

var RULES = [
  'DOMAIN,cdn.jsdmirror.com,直连',
  'RULE-SET,private,直连',
  // 广告规则集前置：国内 App 的广告域名大多在 cn 域名表内，放在 cn 直连之前才拦得住
  // 若出现误伤（某 App 功能异常），把对应域名填进 AD_WHITELIST_DOMAINS 即可放行
  'RULE-SET,anti_ad,AdBlock',
  'RULE-SET,category-ads,AdBlock',
  'RULE-SET,geolocation-cn,直连',
  'RULE-SET,cn,直连',
  'RULE-SET,games_cn,直连',
  'RULE-SET,nvidia_cn,直连',
  'RULE-SET,apple_cn,直连',
  'RULE-SET,microsoft_cn,直连',
  'DOMAIN,fsend.cn,直连',
  'DOMAIN,international-gfe.download.nvidia.com,直连',
  'DOMAIN-SUFFIX,ctaiot.com,直连',
  // 'AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn_additional),(RULE-SET,cn_ip,no-resolve)))))),REJECT',
  'RULE-SET,googlefcm,FCM',
  'RULE-SET,youtube,YouTube',
  'RULE-SET,google,Google',
  'RULE-SET,google_ip,Google,no-resolve',
  'RULE-SET,ai,AI',
  'RULE-SET,github,GitHub',
  'RULE-SET,microsoft,Microsoft',
  'RULE-SET,microsoft_ip,Microsoft,no-resolve',
  'RULE-SET,apple,Apple',
  'RULE-SET,apple_ip,Apple,no-resolve',
  'RULE-SET,telegram,Telegram',
  'RULE-SET,telegram_ip,Telegram,no-resolve',
  'RULE-SET,steam,Steam',
  'RULE-SET,steam_ip,Steam,no-resolve',
  'RULE-SET,tiktok,TikTok',
  'RULE-SET,tiktok_ip,TikTok,no-resolve',
  'RULE-SET,twitter,Twitter',
  'RULE-SET,twitter_ip,Twitter,no-resolve',
  'RULE-SET,meta,Meta',
  'RULE-SET,facebook_ip,Meta,no-resolve',
  'RULE-SET,line,Line',
  'RULE-SET,netflix,Netflix',
  'RULE-SET,netflix_ip,Netflix,no-resolve',
  'RULE-SET,emby,Emby',
  'RULE-SET,emos,Emby',
  'DOMAIN-SUFFIX,mb3admin.com,Emby',
  'DOMAIN-SUFFIX,nubebelle.com,Emby',
  'DOMAIN-KEYWORD,emby,Emby',
  'PROCESS-NAME,com.mb.android,Emby',
  'PROCESS-NAME,tv.emby.embyatv,Emby',
  'PROCESS-NAME,com.hush.yamby,Emby',
  'PROCESS-NAME,com.jellycine.app,Emby',
  'PROCESS-NAME,com.mountains.hills,Emby',
  'PROCESS-NAME,RodelPlayer.App.exe,Emby',
  'PROCESS-NAME,com.feifeiduck.capyplayer,Emby',
  'RULE-SET,pikpak,PikPak',
  'RULE-SET,spotify,Spotify',
  'RULE-SET,spotify_ip,Spotify,no-resolve',
  'RULE-SET,cryptocurrency,Crypto',
  'RULE-SET,paypal,PayPal',
  'RULE-SET,patreon,Patreon',
  'RULE-SET,ehentai,EHentai',
  'RULE-SET,geolocation-!cn,手动选择',
  'RULE-SET,cn_ip,直连',
  'RULE-SET,private_ip,直连',
  'MATCH,漏网之鱼'
]

function applyDefaults(target, defaults) {
  for (var key in defaults) {
    if (target[key] === undefined || target[key] === null) target[key] = defaults[key]
  }
}

function mergeDirectProxies(config) {
  if (!Array.isArray(config.proxies)) config.proxies = []
  var existing = {}
  var i
  for (i = 0; i < config.proxies.length; i++) {
    var p = config.proxies[i]
    if (p && p.name) existing[p.name] = true
  }
  for (i = 0; i < DIRECT_PROXIES.length; i++) {
    var d = DIRECT_PROXIES[i]
    if (!existing[d.name]) {
      var copy = {}
      for (var k in d) copy[k] = d[k]
      config.proxies.push(copy)
    }
  }
}

function sanitizeProviders(providers) {
  if (!ENABLE_JUNK_FILTER) return
  if (!providers || typeof providers !== 'object') return
  for (var key in providers) {
    var provider = providers[key]
    if (!provider || typeof provider !== 'object') continue
    if (!provider['exclude-filter']) {
      provider['exclude-filter'] = FILTER_JUNK
    } else {
      provider['exclude-filter'] = '(?:' + provider['exclude-filter'] + ')|' + FILTER_JUNK
    }
  }
}

function main(config, profileName) {
  config = config || {}

  applyDefaults(config, BASE_SETTINGS)

  mergeDirectProxies(config)

  sanitizeProviders(config['proxy-providers'])

  config['proxy-groups'] = buildProxyGroups(Object.keys(config['proxy-providers'] || {}))

  config['rule-providers'] = Object.assign({}, config['rule-providers'] || {}, RULE_PROVIDERS)

  config.dns = DNS

  config.hosts = Object.assign({}, config.hosts || {}, HOSTS)

  config.profile = Object.assign({ 'store-selected': true, 'store-fake-ip': true }, config.profile || {})

  // 规则顺序：广告白名单（放行）→ 应用专项拦截 → 自定义规则 → 主规则表
  config.rules = buildAdWhitelistRules().concat(APP_AD_RULES, buildCustomRules(), RULES)

  return config
}
