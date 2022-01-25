/////////////////////////////////////////////////////////////////////////////////
//
// 固定値等
//
////////////////////////////////////////////////////////////////////////////////

module.exports.eventType = {
    "join":"join",
    "follow":"follow",
    "message":"message",
    "postback":"postback",
};

module.exports.userState = {
    "None":0,
    "NameInput":1,//名前入力待ち状態
    "Janken":2//じゃんけん中

}

module.exports.jankenStartInput = "じゃんけん";

module.exports.jankenEnum = {
    "0":"グー",
    "1":"チョキ",
    "2":"パー"
}

module.exports.winRate = 60;

module.exports.drawRate = 20;

module.exports.loseRate = 20;

module.exports.guImageUrl = "https://janken.s3.amazonaws.com/janken_gu.png";

module.exports.chokiImageUrl = "https://janken.s3.amazonaws.com/janken_choki.png";

module.exports.paImageUrl = "https://janken.s3.amazonaws.com/janken_pa.png";