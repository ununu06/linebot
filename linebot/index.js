/////////////////////////////////////////////////////////////////////////////////
//
// LINEBot会話関連メインプログラム
//
////////////////////////////////////////////////////////////////////////////////


const crypto = require('crypto');
const constData = require("./constData.js");
const dynamoDao = require("./dynamoDao.js");
const sendMessage = require("./sendMessage.js");

exports.handler = function(event, context, callback) 
{
    console.log(event);
    let signature = crypto.createHmac('sha256', process.env.CHANNELSECRET).update(event.body).digest('base64');
    let checkHeader = (event.headers || {})['x-line-signature'];
    console.log(event.body);
    //認証を行う
    if(signature === checkHeader)
    {
        console.log("認証成功");
        JSON.parse(event.body).events.forEach(lineEvent =>{
            console.log(lineEvent);
            mainJob(lineEvent);
        });
    }
    else
    {
        console.log("認証失敗");
        callback(null,400);
    }
    // callback(null,200);
}

function mainJob(lineEvent){
    switch(lineEvent.type){
        //Botと友達になった際のイベント
        //ユーザ登録を行い、登録メッセージを送信する
        case constData.eventType.follow:
            dynamoDao.putInitUserState(lineEvent.source.userId)
            .then(function(){
                sendMessage.regist(lineEvent.replyToken);
            });
            break;
        //ユーザがテキストメッセージを送信した際の処理
        //ユーザの状態に応じて処理を行う
        case constData.eventType.message:
            dynamoDao.getUser(lineEvent.source.userId).then(function(userData){
                console.log(userData);
                switch(userData.Item.State){
                    case 1://名前入力待ち状態なので名前登録を行い、メッセージを送信する]
                    console.log("名前入力イベント");
                    dynamoDao.updateUserName(lineEvent.source.userId,lineEvent.message.text).then(function(){
                        sendMessage.nameRegist(lineEvent.replyToken,lineEvent.message.text);
                    });
                        break;
                    case 2://じゃんけん状態の時はじゃんけんメッセージを送信する
                        sendMessage.janken(lineEvent.replyToken);
                        break;
                    default:
                        //ユーザの状態が設定されていないとき
                        switch(lineEvent.message.text){
                            //じゃんけんを開始する
                            case constData.jankenStartInput:
                                dynamoDao.updateJankenState(lineEvent.source.userId).then(function(){
                                    sendMessage.janken(lineEvent.replyToken);
                                });
                                break;
                        }
                        break;
                }
            });
            break;
        case constData.eventType.postback:
            dynamoDao.getUser(lineEvent.source.userId).then(function(userData){
                console.log(userData);
                //じゃんけん状態のときのみじゃんけん処理を行う
                if(userData.Item.State == constData.userState.Janken){
                    jankenMain(lineEvent,userData);
                }
            });
            break;
    }
}

//じゃんけんメイン処理部分
function jankenMain(lineEvent, userData){
    //勝敗判定を行うが、適当に確立で決める
    //勝利67%、あいこ13%、負け20%
    let randomNum = Math.floor(Math.random() * 101);
    //勝ち
    if(randomNum < constData.winRate){
        console.log("勝ち");
        dynamoDao.updateJankenWin(userData).then(function(result){
            result["yourHand"] = lineEvent.postback.data;
            result = setJankenResult(result, 0);
            sendMessage.jankenWin(lineEvent.replyToken,result);
        });
    }
    //あいこ
    else if(randomNum < constData.winRate + constData.drawRate){
        console.log("あいこ");
        let result = {
            "winCount":userData.Item.WinCount,
            "maxWinCount":userData.Item.MaxWinCount
        }
        result["yourHand"] = lineEvent.postback.data;
        result = setJankenResult(result, 1);
        sendMessage.jankenDraw(lineEvent.replyToken,result);
    }
    //負け
    else{
        console.log("負け");
        dynamoDao.updateJankenLose(userData).then(function(result){
            result["yourHand"] = lineEvent.postback.data;
            result = setJankenResult(result, 2);
            sendMessage.jankenLose(lineEvent.replyToken,result);
        });
    }
}

//じゃんけん結果を設定する 0:勝ち 1:引き分け 2:負け
function setJankenResult(result, winResult){
    //勝ち
    if(winResult == 0){
        //自分がグー
        if(result.yourHand == "0"){
            //チョキ
            result["enemyHand"] = "1";
        }
        //自分がチョキ
        else if(result.yourHand == "1"){
            //パー
            result["enemyHand"] = "2";
        }
        //自分がパー
        else{
            //グー
            result["enemyHand"] = "0";
        }
    }
    //引き分け
    else if(winResult == 1){
        result["enemyHand"] = result.yourHand;
    }
    //負け
    else{
        //自分がグー
        if(result.yourHand == "0"){
            //パー
            result["enemyHand"] = "2";
        }
        //自分がチョキ
        else if(result.yourHand == "1"){
            //グー
            result["enemyHand"] = "0";
        }
        //自分がパー
        else{
            //チョキ
            result["enemyHand"] = "1";
        }
    }
    return result;
}