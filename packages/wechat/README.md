# @cool-ui/wechat

Native WeChat Mini Program custom components for base library 3.14.3 and newer.

```json
{
  "usingComponents": {
    "cool-button": "@cool-ui/wechat/dist/components/cool-button/index",
    "cool-glass-surface": "@cool-ui/wechat/dist/components/cool-glass-surface/index"
  }
}
```

Run `pnpm --dir packages/wechat build` before local linking. Values are controlled: bind `change`, update the owning page state, then pass the new value back to the component. Set `transparency-mode="reduced"` to force solid surfaces.
