/////////////////////////////////////////////////////////////////////////////////
//
// メッセージ定義
//
////////////////////////////////////////////////////////////////////////////////

const { RedshiftData } = require("aws-sdk");
const constData = require("./constData.js");

//Bot登録時に送信されるメッセージ
module.exports.registeredMessage = "じゃんけん王決定戦にエントリーいただきありがとうございます。\n最初に、貴方のお名前を入力して送信してください。";

//入力された名前を確認する
module.exports.nameRegistMessage = "お名前を {name} で登録しました。";

//じゃんけんアナウンス
module.exports.jankenAnnounceMessage = "じゃんけんを開始するには、「じゃんけん」と入力して送信してください。";

//じゃんけん
module.exports.jankenStartMessage = "じゃーんけーん\n[出す手を選択してください]";

//ぽん
const ponMessage = "$\nぽん[↑相手の出した手]";

//あなたの出した手
const ponYourHandMessage = "$\n[↑あなたの出した手]";

//あなたの勝ち
const yourWinMessage = "あなたの勝利です。\n現在 {winCount} 連勝中です。\n最高連勝記録は {maxWinCount} 回です。\n次の勝負を行います。";

//あなたの負け
const yourLoseMessage = "あなたの負けです。\n連勝記録は {winCount} 回でした。\n最高連勝記録は {maxWinCount} 回です。\n再度じゃんけんを行うには、「じゃんけん」と入力してください。";

//引き分け
const drawMessage = "引き分けです。\n次の勝負を行います。";

//入力エラー(TBD)
module.exports.unknownMessage = "入力を認識出来ませんでした。";

//じゃんけんテンプレ
const jankenTemplate = {
    "type": "template",
    "altText": "出す手を選択してください。",
    "template": {
        "type": "image_carousel",
        "columns": [
            {
              "imageUrl": constData.guImageUrl,
              "action": {
                "type": "postback",
                "label": "グー",
                "data": "0"
              }
            },
            {
              "imageUrl": constData.chokiImageUrl,
              "action": {
                "type": "postback",
                "label": "チョキ",
                "data": "1"
              }
            },
            {
              "imageUrl": constData.paImageUrl,
              "action": {
                "type": "postback",
                "label": "パー",
                "data": "2"
              }
            }
        ]
    }
};

//じゃんけんカルーセル
const jankenCarouser = [{
    type: 'text',
    text: "じゃーんけーん\n[出す手を選択してください]"
},
jankenTemplate
];

module.exports.jankenCarouser = jankenCarouser;

const guEmoji = [
    {
    "index": 0,
    "productId": "5ac21e6c040ab15980c9b444",
    "emojiId": "023"
    },
]

const chokiEmoji = [
    {
    "index": 0,
    "productId": "5ac21e6c040ab15980c9b444",
    "emojiId": "025"
    },
]

const paEmoji = [
    {
    "index": 0,
    "productId": "5ac21e6c040ab15980c9b444",
    "emojiId": "028"
    },
]

const handEmojis = [
    {
        "hand":"0",
        "object":guEmoji
    },
    {
        "hand":"1",
        "object":chokiEmoji
    },
    {
        "hand":"2",
        "object":paEmoji
    },
]

//じゃんけん勝利時のメッセージ
module.exports.jankenWinMessage = function(result){
    let retMessage = [
        {
            type: 'text',
            text: ponMessage,
            "emojis": [
                handEmojis.find(item => item.hand == result.enemyHand).object[0]
            ]
        },
        {
            type: 'text',
            text: ponYourHandMessage,
            "emojis": [
                handEmojis.find(item => item.hand == result.yourHand).object[0]
            ]
        },
        {
            type: 'text',
            text: yourWinMessage.replace("{winCount}",result.winCount).replace("{maxWinCount}",result.maxWinCount)
        },
        jankenTemplate
    ]
    return retMessage;
}

//じゃんけん引き分け時のメッセージ
module.exports.jankenDrawMessage = function(result){
    let retMessage = [
        {
            type: 'text',
            text: ponMessage,
            "emojis": [
                handEmojis.find(item => result.enemyHand == item.hand).object[0]
            ]
        },
        {
            type: 'text',
            text: ponYourHandMessage,
            "emojis": [
                handEmojis.find(item => result.yourHand == item.hand).object[0]
            ]
        },
        {
            type: 'text',
            text: drawMessage
        },
        jankenTemplate
    ]
    return retMessage;
}

//じゃんけん敗北時のメッセージ
module.exports.jankenLoseMessage = function(result){
    let retMessage = [
        {
            type: 'text',
            text: ponMessage,
            "emojis": [
                handEmojis.find(item => result.enemyHand == item.hand).object[0]
            ]
        },
        {
            type: 'text',
            text: ponYourHandMessage,
            "emojis": [
                handEmojis.find(item => result.yourHand == item.hand).object[0]
            ]
        },
        {
            type: 'text',
            text: yourLoseMessage.replace("{winCount}",result.winCount).replace("{maxWinCount}",result.maxWinCount)
        },
    ]
    return retMessage;
}