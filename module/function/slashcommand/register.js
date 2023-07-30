module.exports = async(interaction)=>{
  const { ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, Colors } = require("discord.js");
  const db = require("../../lib/db");
  if(!interaction.isChatInputCommand()) return;
  if(interaction.commandName === "register"){

    if(interaction.user.id !== interaction.guild.ownerId) return await interaction.reply({
      embeds:[{
        color: Colors.Red,
        author:{
          name: "権限がありません",
          icon_url: "https://cdn.taka.cf/images/system/error.png"
        },
        description: "このコマンドを実行するには以下の権限を持っている必要があります",
        fields:[
          {
            name: "必要な権限",
            value: "```所有者```"
          }
        ]
      }],
      ephemeral: true
    });
  
    if(!interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.CreateInstantInvite)) return await interaction.reply({
      embeds:[{
        color: Colors.Red,
        author:{
          name: "BOTに権限がありません",
          icon_url: "https://cdn.taka.cf/images/system/error.png"
        },
        description: "このコマンドはBOTに以下の権限が必要です",
        fields:[
          {
            name: "必要な権限",
            value: "```招待リンクの作成```"
          }
        ]
      }],
      ephemeral: true
    });

    const data = await db(`SELECT * FROM server WHERE id = ${interaction.guild.id} LIMIT 1;`);
    if(data[0]){
      await db(`DELETE FROM server WHERE id = ${interaction.guild.id};`);

      await interaction.reply({
        embeds:[{
          color: Colors.Green,
          author:{
            name: "登録を解除しました",
            icon_url: "https://cdn.taka.cf/images/system/success.png"
          }
        }]
      });
    }else{
      const account = await db(`SELECT * FROM account WHERE id = ${interaction.user.id} LIMIT 1;`);
      if(!account[0]) return await interaction.reply({
        embeds:[{
          color: Colors.Red,
          author:{
            name: "登録できませんでした",
            icon_url: "https://cdn.taka.cf/images/system/error.png"
          },
          description: "このサーバーを掲示板に登録するには認証する必要があります"
        }],
        components:[
          new ActionRowBuilder()
            .addComponents( 
              new ButtonBuilder()
                .setLabel("サイトへ飛ぶ")
                .setURL("https://auth.taka.cf/")
                .setStyle(ButtonStyle.Link)
            )
        ],
        ephemeral: true
      });
  
      if(new Date()-new Date(account[0].time)>180000) return await interaction.reply({
        embeds:[{
          color: Colors.Red,
          author:{
            name: "登録できませんでした",
            icon_url: "https://cdn.taka.cf/images/system/error.png"
          },
          description: `前回の認証から3分以上が経過しているため再度認証を行なってください\n前回の認証日時: ${new Date(account[0].time).toLocaleString()}`
        }],
        components:[
          new ActionRowBuilder()
            .addComponents( 
              new ButtonBuilder()
                .setLabel("サイトへ飛ぶ")
                .setURL("https://auth.taka.cf/")
                .setStyle(ButtonStyle.Link)
            )
        ],
        ephemeral: true
      });

      await interaction.channel.createInvite({"unique": true})
        .then(async(invite)=>{
          await db(`INSERT INTO server (id, owner, link, time) VALUES("${interaction.guild.id}","${interaction.guild.ownerId}}","${invite.url}",NOW());`);

          await interaction.reply({
            embeds:[{
              color: Colors.Green,
              author:{
                name: "登録しました",
                icon_url: "https://cdn.taka.cf/images/system/success.png"
              },
              description: "サーバー掲示板に公開されます"
            }]
          });
        })
        .catch(async(error)=>{
          await interaction.reply({
            embeds:[{
              color: Colors.Red,
              author:{
                name: "登録できませんでした",
                icon_url: "https://cdn.taka.cf/images/system/error.png"
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
                    .setURL("https://discord.gg/NEesRdGQwD")
                    .setStyle(ButtonStyle.Link))
            ],
            ephemeral: true
          });
        });
    }
  }
}