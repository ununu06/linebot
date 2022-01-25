/////////////////////////////////////////////////////////////////////////////////
//
// LINEBotじゃんけん結果集計メッセージ送信
//
////////////////////////////////////////////////////////////////////////////////

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({region: process.env.DYNAMODB_REGION});
const line = require('@line/bot-sdk');
const lineClient = new line.Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

exports.handler = function(event, context, callback) 
{
    console.log(event);
    let param = {
        TableName:process.env.JANKEN_TABLE_NAME,
    };
    console.log(param);
    let promise = new Promise(function(resolve)
    {
        docClient.scan(param,function(err,data)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                resolve(data);
            }
        });
    }).then((data) =>{
        console.log(data);
        //TODO:scanは、1回で1MBしか取得できない制約があり、取得データが1MBを超える場合、data.LastEvaluatedKeyに
        //何かしらの値が入ってくる。今回は1MB絶対超えないだろうからscanのループ処理をサボってるけど、
        //基本的には実装しなければいけません。
        let items = data.Items;
        //最大連勝数の降順、最大勝利数更新時間の昇順でソート
        items.sort(function(a,b){
            if(a.MaxWinCount != b.MaxWinCount){
                return(a.MaxWinCount - b.MaxWinCount) * -1;
            }
            if(a.MaxWinCountUpdatedDateTime != b.MaxWinCountUpdatedDateTime){
                if(a.MaxWinCountUpdatedDateTime > b.MaxWinCountUpdatedDateTime){
                    return -1;
                }
                if(a.MaxWinCountUpdatedDateTime < b.MaxWinCountUpdatedDateTime){
                    return -1;
                }
            }
        });
        //メッセージ送信を行う
        //TODO:こちらも最大同時送信人数は500人の制約があるが、絶対超えないだろうからさぼってます。
        //上位3人の登録名と勝利数を取得
        let message = "今回のじゃんけん上位入賞者は以下の通りです。\n\n";
        message += "優勝\n";
        message += "連勝記録: " + items[0].MaxWinCount + " 回\n";
        message += "名前: " + items[0].Name + "\n\n";
        message += "2位\n";
        message += "連勝記録: " + items[1].MaxWinCount + " 回\n";
        message += "名前: " + items[1].Name + "\n\n";
        message += "3位\n";
        message += "連勝記録: " + items[2].MaxWinCount + " 回\n";
        message += "名前: " + items[2].Name;
        let requestMessage = [{
            type: 'text',
            text: message
          },
        ];
        //送信先を設定
        let sendTargets = [];
        items.forEach(item =>{
            sendTargets.push(item.UserId);
        });
        lineClient.multicast(sendTargets, requestMessage)
        .then(() =>{
    
        })
        .catch((err) =>{
            console.log(err);
        });
    })
    
}
