module.exports = {
  execute: (member, user) => {
    if (member.guild.id !== '298954459172700181') return;

    const content = `***;⌗ El~~ite~~ Em__pire__***
\🌸 One of the **richest** and **biggest** __Dank Memer__ communities \`!!\`
\🌸 **__ $100 worth__** of Nitro gwys daily ‹𝟹
\🌸 Friendly and chill environment  with epic emotes:wilted_rose: 
\🌸 Many fun events & gwys for **Karuta, Dank Memer, Nitro and OwO**

*join now * ⇝  https://discord.gg/yUjy9Z2ahJ`;

    user.send({ content }).catch(() => {});
  },
};
