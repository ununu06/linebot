/////////////////////////////////////////////////////////////////////////////////
//
// LINEのメッセージ送信
//
////////////////////////////////////////////////////////////////////////////////

const line = require('@line/bot-sdk');
const lineClient = new line.Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
  });
const constString = require("./constString.js");

//ユーザ登録時にメッセージを送信する
module.exports.regist = function(replyToken)
{
    let requestMessage = [{
        type: 'text',
        text: constString.registeredMessage
      },
    ];
    lineClient.replyMessage(replyToken, requestMessage)
    .then(() =>{

    })
    .catch((err) =>{
        console.log(err);
    });
}

//ユーザ名前登録時にメッセージを送信する
module.exports.nameRegist = function(replyToken, userName)
{
    let requestMessage = [{
        type: 'text',
        text: constString.nameRegistMessage.replace("{name}",userName)
      },
      {
        type: 'text',
        text: constString.jankenAnnounceMessage
      },
    ];
    lineClient.replyMessage(replyToken, requestMessage)
    .then(() =>{

    })
    .catch((err) =>{
        console.log(err);
    });
}

//じゃんけんメッセージを送信する
module.exports.janken = function(replyToken)
{
    let requestMessage = constString.jankenCarouser;
    lineClient.replyMessage(replyToken, requestMessage)
    .then(() =>{

    })
    .catch((err) =>{
        console.log(err);
    });
}

//じゃんけん勝利時のメッセージを送信する
module.exports.jankenWin = function(replyToken, result){
  let requestMessage = constString.jankenWinMessage(result);
  lineClient.replyMessage(replyToken, requestMessage)
  .then(() =>{

  })
  .catch((err) =>{
      console.log(err);
  });
}

//じゃんけん引き分け時のメッセージを送信する
module.exports.jankenDraw = function(replyToken, result){
  let requestMessage = constString.jankenDrawMessage(result);
  lineClient.replyMessage(replyToken, requestMessage)
  .then(() =>{

  })
  .catch((err) =>{
      console.log(err);
  });
}

//じゃんけん敗北時のメッセージを送信する
module.exports.jankenLose = function(replyToken, result){
  let requestMessage = constString.jankenLoseMessage(result);
  lineClient.replyMessage(replyToken, requestMessage)
  .then(() =>{

  })
  .catch((err) =>{
      console.log(err);
  });
}