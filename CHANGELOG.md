# CHANGELOG

## 2026-11-19 — 仓库建立，广告拦截细化

以用户在用的 JS 覆写脚本为基线建仓，本版改动：

- 新增 `APP_AD_RULES` 应用专项拦截区，首条为红果短剧（com.phoenix.read）穿山甲拦截：
  `pangolin` 关键词、pglstatp-toutiao.com、pglstatp-toutiao-b.com、-ad-sign.byteimg.com、zlink.ugsdk.cn（清单来源：社区项目 HongGuo Lite 抓包验证版）
- 新增 anti-AD 规则集（`anti_ad` provider，https://anti-ad.net/clash.yaml），与 `category-ads` 一起前置到 cn 直连规则之前——此前广告规则排在 cn 之后，字节系广告域名被直连先放行、拦不住
- 新增 `AD_WHITELIST_DOMAINS` 广告白名单机制（生成的直连规则排在所有拦截规则之前）
- 自动选择 / 负载均衡 / 国家组加 `exclude-filter: 直连`，防止直连伪节点被 url-test 选出
- 修复 `NODE_FILTER_*` 全部 13 处写坏的量词 `{2|}` → `{1,2}`
- FCM 去掉 `selected: '直连'`，不再默认直连
- 新增 `override.yaml`：规则层 YAML 覆写（47 个 rule-providers + 3 条 prepend-rules），providers 段由脚本从 override.js 自动生成、保持一致
- 已用 node 实跑 main() 验证：51 个分组、47 个 rule-providers、60 条规则，顺序与排除项符合预期
