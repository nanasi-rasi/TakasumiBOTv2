module.exports = async(interaction)=>{
  const { Colors } = require("discord.js");
  const money = require("../../lib/money");
  if(!interaction.isChatInputCommand()) return;
  if(interaction.commandName === "money"){
    const user = interaction.options.getUser("user");

    if(!user){
      const data = await money.get(interaction.user.id);
      await interaction.reply({
        embeds:[{
          color: Colors.Green,
          author:{
            name: `${interaction.user.tag}の持ち物`,
            icon_url: "https://cdn.taka.cf/images/system/success.png"
          },
          fields:[
            {
              name: "残高",
              value: `${data.amount}円`
            },
            {
              name: "アイテム",
              value: `GC黄色: ${data.yellow}回\nGC赤色: ${data.red}回\nGC青色: ${data.blue}回`,
            }
          ]
        }]
      });
    }else{
      const data = await money.get(user.id);
      await interaction.reply({
        embeds:[{
          color: Colors.Green,
          author:{
            name: `${user.tag}の持ち物`,
            icon_url: "https://cdn.taka.cf/images/system/success.png"
          },
          fields:[
            {
              name: "残高",
              value: `${data?.amount}円`
            },
            {
              name: "アイテム",
              value: `GC黄色: ${data?.yellow}回\nGC赤色: ${data?.red}回\nGC青色: ${data?.blue||0}回`,
            }
          ]
        }]
      });
    }
  }
}