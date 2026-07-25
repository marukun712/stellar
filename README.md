# Stellar

## 概要

Stellarは、Blueskyの投稿に対して簡易的な絵文字リアクションを付けるための、シンプルなLexicon・仕様群です。

サンプル絵文字サーバーを提供しています。Server SettingsからこちらのURLを指定することで、[decomoji](https://github.com/decomoji/decomoji)が使えます。

`https://marukun712.github.io/stellar`

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
