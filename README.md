# Stellar

## 概要

Stellarは、Blueskyの投稿に対して簡易的な絵文字リアクションを付けるための、シンプルなLexicon・仕様群です。

サンプル絵文字サーバーを提供しています。Server SettingsからこちらのURLを指定することで、[decomoji](https://github.com/decomoji/decomoji)が使えます。

`https://marukun712.github.io/stellar`

---

## reaction-display Web Component

リアクションを表示する Web Component を提供しています。

### 導入

```html
<script src="https://marukun712.github.io/stellar/reaction-display.iife.js"></script>
```

### 使い方

```html
<reaction-display
  post-uri="at://did:plc:xxx/app.bsky.feed.post/yyy"
></reaction-display>
```

| 属性 | 説明 |
| --- | --- |
| `post-uri` | リアクションを取得する投稿の AT URI |

---

## 仕様の構成

Stellar は以下の3つの要素で成り立っています。

### 1. Lexicon

ATProtocol のレコード仕様です。`blue.maril.stellar.reaction` がリアクション本体、`blue.maril.stellar.servers` が投稿者の許可サーバー一覧を表します。

### 2. 絵文字サーバー

絵文字の画像をホスティングするサーバーです。絵文字パックは個人の PDS で所有するものではなく、複数人で共同運用されるものです。そのため、共同管理しやすいシンプルな HTTP ベースのサーバーとして ATProtocol 外で定義しています。また ATProtocol にはモデレーション機構が豊富に備わっていますが、絵文字リアクションにそのコストをかけるのは過剰であり、この点でもシンプルな HTTP ベースの構成が適切と判断しました。

### 3. reaction-display

リアクションを表示する Web Component です。投稿者が `blue.maril.stellar.servers` で許可したサーバーの絵文字だけを表示します。

---

## Lexicon 仕様

### `blue.maril.stellar.reaction`

リアクションを表すレコードです。ユーザーのリポジトリに作成されます。

| フィールド  | 型              | 必須 | 説明                                       |
| ----------- | --------------- | ---- | ------------------------------------------ |
| `subject`   | `strongRef`     | yes  | リアクション対象の投稿 (uri + cid)         |
| `createdAt` | `string` (datetime) | yes  | リアクションの作成日時                     |
| `emoji`     | `string` (uri)  | yes  | 絵文字画像の URL                           |
| `via`       | `strongRef`     | no   | 経由した投稿への参照 (リポスト経由の場合など) |

- collection: `blue.maril.stellar.reaction`
- key: `tid`

---

### `blue.maril.stellar.servers`

投稿者が許可する絵文字サーバーの一覧を表すレコードです。

| フィールド | 型              | 必須 | 説明                       |
| ---------- | --------------- | ---- | -------------------------- |
| `url`      | `string[]` (uri) | yes  | 許可する絵文字サーバーの URL 一覧 |

- collection: `blue.maril.stellar.servers`
- key: `self` (1ユーザーにつき1レコード)

---

## 絵文字サーバーの仕様

絵文字サーバーは以下のエンドポイントを提供する必要があります。

### `GET /emojis.json`

利用可能な絵文字名の一覧を返します。

```json
{
  "emojis": ["emoji_name_1", "emoji_name_2"]
}
```

### `GET /emoji/{name}.png`

絵文字名に対応する画像ファイルを返します。

---

## リアクションの表示ロジック

1. 対象投稿への `blue.maril.stellar.reaction` レコードのバックリンクを取得する
2. 投稿者の `blue.maril.stellar.servers` レコードから許可サーバー一覧を取得する
3. 各リアクションの `emoji` URL が許可サーバーのいずれかのベース URL から始まるものだけを表示する
4. 同じ絵文字 URL ごとにカウントして集計し、絵文字チップとして表示する

許可サーバー以外からの絵文字は表示されません。これにより投稿者がリアクションに使える絵文字を制御できます。

---

## 絵文字サーバーの登録方法

自分のリポジトリの `blue.maril.stellar.servers` / `self` レコードに、許可するサーバーの URL を配列で設定します。

```json
{
  "$type": "blue.maril.stellar.servers",
  "url": ["https://example.com/emoji-server/"]
}
```
