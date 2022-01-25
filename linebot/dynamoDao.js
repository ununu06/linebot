/////////////////////////////////////////////////////////////////////////////////
//
// DynamoDB操作
//
////////////////////////////////////////////////////////////////////////////////

const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({region: process.env.DYNAMODB_REGION});
const constData = require("./constData.js");
const moment = require('moment');

//ユーザーの初期ステータスを登録する
module.exports.putInitUserState = function(userId)
{
    let param = {
        TableName:process.env.JANKEN_TABLE_NAME,
        Item:{
            "BelongsId":userId,
            "UserId":userId,
            "Name":"",
            "State":constData.userState.NameInput,
            "WinCount":0,
            "MaxWinCount":0,
            "MaxWinCountUpdatedDateTime":"",
            "CreatedDateTime":moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            "UpdatedDateTime":moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        }
    };
    console.log(param);
    return new Promise(function(resolve)
    {
        docClient.put(param,function(err,data)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                resolve();
            }
        });
    });
}

//ユーザ情報を取得する
module.exports.getUser = function(userId)
{
    let param = {
        TableName:process.env.JANKEN_TABLE_NAME,
        Key:{
            "BelongsId":userId,
            "UserId":userId
        }
    };
    return new Promise(function(resolve)
    {
        docClient.get(param,function(err,data)
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
    });
}

//ユーザ名を更新する
module.exports.updateUserName = function(userId,userName){
    let param = {
        TableName: process.env.JANKEN_TABLE_NAME,
        Key:{
            "BelongsId":userId,
            "UserId":userId
        },
        ExpressionAttributeNames:{
            '#i':'Name',
            '#iut':'UpdatedDateTime',
            '#ist':'State'
        },
        ExpressionAttributeValues:{
            ':newName':userName,
            ':newUpdatedDatetime':moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            ':newState':constData.userState.None
        },
        UpdateExpression:'SET #i = :newName, #iut = :newUpdatedDatetime, #ist = :newState'
    };
    console.log(param);
    return new Promise(function(resolve)
    {
        docClient.update(param,function(err,updateData)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                resolve();
            }
        });
    });
}

//ユーザのステータスをじゃんけん状態に変更する
module.exports.updateJankenState = function(userId){
    let param = {
        TableName: process.env.JANKEN_TABLE_NAME,
        Key:{
            "BelongsId":userId,
            "UserId":userId
        },
        ExpressionAttributeNames:{
            '#iut':'UpdatedDateTime',
            '#ist':'State'
        },
        ExpressionAttributeValues:{
            ':newUpdatedDatetime':moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            ':newState':constData.userState.Janken
        },
        UpdateExpression:'SET #iut = :newUpdatedDatetime, #ist = :newState'
    };
    console.log(param);
    return new Promise(function(resolve)
    {
        docClient.update(param,function(err,updateData)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log(updateData);
                resolve();
            }
        });
    });
}

//じゃんけん勝利時に結果を更新する
module.exports.updateJankenWin = function(userData){
    let winCount = userData.Item.WinCount + 1;
    let maxWinCount = userData.Item.MaxWinCount;
    let maxWinCountUpdatedDateTime = userData.Item.MaxWinCountUpdatedDateTime;
    if(userData.Item.MaxWinCount < winCount){
        maxWinCount++;
        maxWinCountUpdatedDateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    }
    let param = {
        TableName: process.env.JANKEN_TABLE_NAME,
        Key:{
            "BelongsId":userData.Item.BelongsId,
            "UserId":userData.Item.UserId
        },
        ExpressionAttributeNames:{
            '#iut':'UpdatedDateTime',
            '#iwc':'WinCount',
            '#imwc':'MaxWinCount',
            '#imwcd':'MaxWinCountUpdatedDateTime',
        },
        ExpressionAttributeValues:{
            ':newUpdatedDatetime':moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            ':newWinCount':winCount,
            ':newMaxWinCount':maxWinCount,
            ':newMaxWinCountUpdatedDateTime':maxWinCountUpdatedDateTime,
        },
        UpdateExpression:'SET #iut = :newUpdatedDatetime, #iwc = :newWinCount, #imwc = :newMaxWinCount, #imwcd = :newMaxWinCountUpdatedDateTime'
    };
    let result = {
        "winCount":winCount,
        "maxWinCount":maxWinCount
    }
    console.log(param);
    return new Promise(function(resolve)
    {
        docClient.update(param,function(err,updateData)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                resolve(result);
            }
        });
    });
}

//じゃんけん敗北時に結果を更新する
module.exports.updateJankenLose = function(userData){
    let param = {
        TableName: process.env.JANKEN_TABLE_NAME,
        Key:{
            "BelongsId":userData.Item.BelongsId,
            "UserId":userData.Item.UserId
        },
        ExpressionAttributeNames:{
            '#iut':'UpdatedDateTime',
            '#iwc':'WinCount',
            '#ist':'State',
        },
        ExpressionAttributeValues:{
            ':newUpdatedDatetime':moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            ':newWinCount':0,
            ':newState':constData.userState.None,
        },
        UpdateExpression:'SET #iut = :newUpdatedDatetime, #iwc = :newWinCount, #ist = :newState'
    };
    let result = {
        "winCount":userData.Item.WinCount,
        "maxWinCount":userData.Item.MaxWinCount
    }
    console.log(param);
    return new Promise(function(resolve)
    {
        docClient.update(param,function(err,updateData)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                resolve(result);
            }
        });
    });
}