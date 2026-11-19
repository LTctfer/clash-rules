# clash-rules — Mihomo 覆写规则（自维护）

个人用的 Mihomo（Clash Meta）覆写配置仓库，专门维护分流分组、规则集与广告拦截。

## 文件

| 文件 | 说明 |
|---|---|
| `override.js` | **主版本**：完整 JS 覆写脚本（分组、DNS、hosts、规则全在这里），客户端里用这个 |
| `override.yaml` | YAML 覆写（仅规则层）：全部 rule-providers + 优先规则（prepend-rules），给支持 YAML Merge 的客户端用；与 JS 有分歧时以 JS 为准 |
| `CHANGELOG.md` | 每次改动的记录 |

## 广告拦截结构（2026-11-19 起）

规则命中顺序（从先到后）：

1. **广告白名单** `AD_WHITELIST_DOMAINS`（override.js 顶部）——误伤时把域名填这里，直连放行
2. **应用专项拦截** `APP_AD_RULES`——按 App 点名拦截，必须排在 cn 直连规则之前，否则被直连先放行
   - 红果短剧（`com.phoenix.read`）：拦穿山甲 SDK（`pangolin` 关键词）、素材域 `pglstatp-toutiao.com`、广告签名域 `-ad-sign.byteimg.com`、跳转 `zlink.ugsdk.cn`
3. **广告大表**：`anti_ad`（anti-AD 中文区大表）+ `category-ads`（bett），在 RULES 里前置到 `geolocation-cn`/`cn` 直连之前
4. 其余服务分流规则

### 红果拦截的注意事项

- 开屏、插播广告走穿山甲，拦掉上面几个域名基本就没了
- 「看广告得金币 / 解锁集数」的激励广告会加载失败，领不到奖励——要薅金币就把红果那条规则注释掉
- 红果自家 API 下发的广告走 `*.snssdk.com`（路径带 `/api/ad/`），域名层拦不了，需要 MITM，本仓库不做
- **红线**：`snssdk.com`、`zijieapi.com`、`fqnovel.com`、`pstatp.com`、`byteimg` 整域不能拦，正片和主 API 走这些域名

### 给新 App 加专项拦截

1. 抓包或查社区规则集，确认该 App 的广告 SDK 域名（穿山甲 `pangolin`、优量汇 `gdt`、百度 `mobads` 等）
2. 在 `APP_AD_RULES` 里加一条 `AND,((PROCESS-NAME,包名),(OR,(...域名条件...))),REJECT`
3. 同步更新 `override.yaml` 的 prepend-rules 和 CHANGELOG

## 本版相对原始模板的其他改动

- 自动选择 / 负载均衡 / 国家组加了 `exclude-filter: 直连`，避免注入的直连伪节点被 url-test 选出（苹果测速页国内有 CDN，直连延迟反而更低）
- 修复 `NODE_FILTER_*` 中写坏的量词 `[A-Za-z]{2|}` → `[A-Za-z]{1,2}`（原写法会被当成字面字符，带尾字母的节点名匹配不上）
- FCM 不再默认直连（国内直连 mtalk.google.com 不通），改为默认走手动选择，直连保留为可选项

## 已知取舍

- 过滤器大量使用预查/后顾（`(?<!...)` 等），需要 Mihomo（regexp2）或 Stash；老 Clash 内核会编译失败
- 单字宽匹配（坡/台/美/港）可能让个别节点串组，属同类配置通病
- 所有分组带 `empty-fallback: REJECT`：订阅整体加载失败时会全网 REJECT，看起来像断网，先查订阅再查规则

## 同步到 GitHub

本地仓库已建好。推送到 GitHub 前需先登录：

```bash
gh auth login
gh repo create clash-rules --private --source=. --push
```
