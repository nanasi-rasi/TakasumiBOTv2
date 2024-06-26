module.exports = async(interaction)=>{
  const { Colors, AttachmentBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
  const db = require("../../lib/db");
  const config = require("../../../config.json");
  if(!interaction.isChatInputCommand()) return;
  if(interaction.commandName === "history"){
    const time = interaction.options.getString("time");

    await interaction.deferReply();
    try{
      const history = (await db(`SELECT * FROM history WHERE user = ${interaction.user.id} ORDER BY time ASC;`));

      if(!history[0]) return await interaction.editReply({
        embeds:[{
          color: Colors.Red,
          author:{
            name: "表示できませんでした",
            icon_url: "https://cdn.takasumibot.com/images/system/error.png"
          },
          description: "取引履歴が存在しません"
        }]
      });

      const table =  history.map(his=>([
        his.id,
        his.reason,
        `${his.amount}コイン`,
        new Date(his.time).toLocaleString()
      ]));

      table.push([
        "-",
        "-",
        "-",
        `合計:${history.reduce((pre,his)=>pre+his.amount,0)}コイン`
      ]);

      const data = await fetch(`${config.api.graph}/table`,{
        "method": "POST",
        "headers":{
          "Content-Type": "application/json"
        },
        "body": JSON.stringify({
          "label": ["取引ID","内容","金額","取引日時"],
          "data": table
        })
      }).then(res=>res.blob());

      await interaction.editReply({
        embeds:[{
          color: Colors.Green,
          author:{
            name: "取引履歴",
            icon_url: "https://cdn.takasumibot.com/images/system/success.png"
          },
          description: "過去1日分を表示しています",
          image:{
            url: "attachment://history.png"
          }
        }],
        files:[
          new AttachmentBuilder()
            .setFile(data.stream())
            .setName("history.png")
        ]
      });
    }catch(error){
      await interaction.editReply({
        embeds:[{
          color: Colors.Red,
          author:{
            name: "表示できませんでした",
            icon_url: "https://cdn.takasumibot.com/images/system/error.png"
          },
          fields:[
            {
              name: "エラーコード",
              value: `\`\`\`${error}\`\`\``
            }
          ]
        }],
        components:[
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel("サポートサーバー")
                .setURL(config.inviteUrl)
                .setStyle(ButtonStyle.Link))
        ]
      });
    }
  }
}