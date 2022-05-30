const Builders = require('@discordjs/builders');

module.exports = {
  async execute() {
    // eslint-disable-next-line global-require
    const client = require('../../../BaseClient/DiscordClient');
    const channel = client.channels.cache.get('805839305377447936');
    const { ch } = client;
    if (channel) {
      const m = await channel.messages.fetch('827248223922946118').catch(() => {});
      if (m && m.id) {
        const res = await ch.query('SELECT * FROM stats;');
        let participants = 0;
        if (res.rows[0].willis) {
          participants = res.rows[0].count;
        }
        const needed = [360];
        const emote = ['', '', ''];
        needed.forEach((maxparticipants, j) => {
          const multiplier = maxparticipants / 100;
          const percent = participants / multiplier;
          let pixels = (750 / 100) * percent;
          let finish = '';
          for (let i = 1; i < 16; i += 1) {
            const floored = Math.floor(pixels);
            let ending;
            pixels -= 50;
            if (i === 1) {
              if (floored < 1) {
                ending = '<:48:814609705838051439>';
              } else if (floored === 2 || floored === 1) {
                ending = '<:47:814609705812492289>';
              } else if (floored === 3) {
                ending = '<:47:814609705812492289>';
              } else if (floored === 4) {
                ending = '<:46:814609706097573928>';
              } else if (floored === 5) {
                ending = '<:45:814609705975808040>';
              } else if (floored === 6) {
                ending = '<:44:814609705648259114>';
              } else if (floored === 7) {
                ending = '<:43:814609705988259840>';
              } else if (floored === 8) {
                ending = '<:42:814609705976463400>';
              } else if (floored === 9) {
                ending = '<:41:814609705904111656>';
              } else if (floored === 10) {
                ending = '<:40:814609705988522034>';
              } else if (floored === 11) {
                ending = '<:39:814609705711173724>';
              } else if (floored === 12) {
                ending = '<:38:814609705883271209>';
              } else if (floored === 13) {
                ending = '<:37:814609705586262027>';
              } else if (floored === 14) {
                ending = '<:36:814609705803710474>';
              } else if (floored === 15) {
                ending = '<:35:814609705845653554>';
              } else if (floored === 16) {
                ending = '<:34:814609705812492309>';
              } else if (floored === 17) {
                ending = '<:33:814609705782476830>';
              } else if (floored === 18) {
                ending = '<:32:814609705312976928>';
              } else if (floored === 19) {
                ending = '<:31:814609705670017116>';
              } else if (floored === 20) {
                ending = '<:30:814609705706979328>';
              } else if (floored === 21) {
                ending = '<:29:814609705812885534>';
              } else if (floored === 22) {
                ending = '<:28:814609705451782165>';
              } else if (floored === 23) {
                ending = '<:27:814609705795190824>';
              } else if (floored === 24) {
                ending = '<:26:814609705774219284>';
              } else if (floored === 25) {
                ending = '<:25:814609705690202143>';
              } else if (floored === 26) {
                ending = '<:24:814609705502376007>';
              } else if (floored === 27) {
                ending = '<:23:814609705724543046>';
              } else if (floored === 28) {
                ending = '<:22:814609706890428426>';
              } else if (floored === 29) {
                ending = '<:21:814609705242066996>';
              } else if (floored === 30) {
                ending = '<:20:814609705548775464>';
              } else if (floored === 31) {
                ending = '<:19:814609705233940541>';
              } else if (floored === 32) {
                ending = '<:18:814609705263562783>';
              } else if (floored === 33) {
                ending = '<:17:814609705665691698>';
              } else if (floored === 34) {
                ending = '<:16:814609705581543464>';
              } else if (floored === 35) {
                ending = '<:15:814609705267494963>';
              } else if (floored === 36) {
                ending = '<:14:814609705452306452>';
              } else if (floored === 37) {
                ending = '<:13:814609705435529216>';
              } else if (floored === 38) {
                ending = '<:12:814609705493987378>';
              } else if (floored === 39) {
                ending = '<:11:814609705368420424>';
              } else if (floored === 40) {
                ending = '<:10:814609705128951819>';
              } else if (floored === 41) {
                ending = '<:9_:814609705371828284>';
              } else if (floored === 42) {
                ending = '<:8_:814609704936407091>';
              } else if (floored === 43) {
                ending = '<:7_:814609705297117214>';
              } else if (floored === 44) {
                ending = '<:6_:814609705271689256>';
              } else if (floored === 45) {
                ending = '<:5_:814609705246785556>';
              } else if (floored === 46) {
                ending = '<:4_:814609705287549012>';
              } else if (floored === 47) {
                ending = '<:3_:814609705237872681>';
              } else if (floored === 48) {
                ending = '<:2_:814609705049522247>';
              } else if (floored === 49) {
                ending = '<:1_:814609705191473162>';
              } else if (floored > 49) {
                ending = '<:0_:814609705196453928>';
              }
            } else if (i === 15) {
              if (floored < 1) {
                ending = '<:48:814609570445262898>';
              } else if (floored === 2 || floored === 1) {
                ending = '<:47:814609570555101224>';
              } else if (floored === 3) {
                ending = '<:47:814609570555101224>';
              } else if (floored === 4) {
                ending = '<:46:814609570403319818>';
              } else if (floored === 5) {
                ending = '<:46:814609570403319818>';
              } else if (floored === 6) {
                ending = '<:45:814609570387329084>';
              } else if (floored === 7) {
                ending = '<:44:814609570034352129>';
              } else if (floored === 8) {
                ending = '<:43:814609570420228127>';
              } else if (floored === 9) {
                ending = '<:42:814609570416558100>';
              } else if (floored === 10) {
                ending = '<:41:814609570504376331>';
              } else if (floored === 11) {
                ending = '<:40:814609570315501638>';
              } else if (floored === 12) {
                ending = '<:39:814609570563358720>';
              } else if (floored === 13) {
                ending = '<:38:814609570378416148>';
              } else if (floored === 14) {
                ending = '<:37:814609569929756754>';
              } else if (floored === 15) {
                ending = '<:36:814609570324152390>';
              } else if (floored === 16) {
                ending = '<:35:814609570987114548>';
              } else if (floored === 17) {
                ending = '<:34:814609569870250007>';
              } else if (floored === 18) {
                ending = '<:33:814609570198323211>';
              } else if (floored === 19) {
                ending = '<:32:814609570155724890>';
              } else if (floored === 20) {
                ending = '<:31:814609569837088779>';
              } else if (floored === 21) {
                ending = '<:30:814609570281422848>';
              } else if (floored === 22) {
                ending = '<:29:814609570147336252>';
              } else if (floored === 23) {
                ending = '<:28:814609570185478164>';
              } else if (floored === 24) {
                ending = '<:27:814609570085208064>';
              } else if (floored === 25) {
                ending = '<:26:814609570139078676>';
              } else if (floored === 26) {
                ending = '<:25:814609570042216458>';
              } else if (floored === 27) {
                ending = '<:24:814609570088615961>';
              } else if (floored === 28) {
                ending = '<:23:814609569765392385>';
              } else if (floored === 29) {
                ending = '<:22:814609569996472370>';
              } else if (floored === 30) {
                ending = '<:21:814609570315632680>';
              } else if (floored === 31) {
                ending = '<:20:814609570038677514>';
              } else if (floored === 32) {
                ending = '<:19:814609569925693500>';
              } else if (floored === 33) {
                ending = '<:18:814609569938538496>';
              } else if (floored === 34) {
                ending = '<:17:814609569807990826>';
              } else if (floored === 35) {
                ending = '<:16:814609569976156220>';
              } else if (floored === 36) {
                ending = '<:15:814609570038546464>';
              } else if (floored === 37) {
                ending = '<:14:814609569833418832>';
              } else if (floored === 38) {
                ending = '<:13:814609569938538517>';
              } else if (floored === 39) {
                ending = '<:12:814609569829224498>';
              } else if (floored === 40) {
                ending = '<:11:814609569707589673>';
              } else if (floored === 41) {
                ending = '<:10:814609569800126474>';
              } else if (floored === 42) {
                ending = '<:8_:814609569903804477>';
              } else if (floored === 43) {
                ending = '<:7_:814609569379647500>';
              } else if (floored === 44) {
                ending = '<:6_:814609569773912064>';
              } else if (floored === 45) {
                ending = '<:5_:814609569703264277>';
              } else if (floored === 46) {
                ending = '<:4_:814609569854259250>';
              } else if (floored === 47) {
                ending = '<:3_:814609569673248808>';
              } else if (floored === 48) {
                ending = '<:2_:814609569731969034>';
              } else if (floored === 49) {
                ending = '<:1_:814609569778237520>';
              } else if (floored > 49) {
                ending = '<:0_:814609569413464115>';
              }
            } else {
              if (floored < 19) {
                ending = '<:50:814609640566030386>';
              } else if (floored === 2 || floored === 1) {
                ending = '<:49:814609640633532467>';
              } else if (floored === 3) {
                ending = '<:48:814609640142536755>';
              } else if (floored === 4) {
                ending = '<:47:814609640519893002>';
              } else if (floored === 5) {
                ending = '<:46:814640088532516924>';
              } else if (floored === 6) {
                ending = '<:45:814609640544534528>';
              } else if (floored === 7) {
                ending = '<:44:814609640305590303>';
              } else if (floored === 8) {
                ending = '<:42:814609640453046312>';
              } else if (floored === 9) {
                ending = '<:41:814609640297201746>';
              } else if (floored === 10) {
                ending = '<:40:814609640456716288>';
              } else if (floored === 11) {
                ending = '<:39:814609640418574357>';
              } else if (floored === 12) {
                ending = '<:38:814609640310046790>';
              } else if (floored === 13) {
                ending = '<:37:814609640440201276>';
              } else if (floored === 14) {
                ending = '<:36:814609640275968041>';
              } else if (floored === 15) {
                ending = '<:35:814609640292876359>';
              } else if (floored === 16) {
                ending = '<:34:814609640373092422>';
              } else if (floored === 17) {
                ending = '<:33:814609640071233548>';
              } else if (floored === 18) {
                ending = '<:32:814609640314765332>';
              } else if (floored === 19) {
                ending = '<:31:814609640091287583>';
              } else if (floored === 20) {
                ending = '<:30:814609640041349143>';
              } else if (floored === 21) {
                ending = '<:29:814609640305983558>';
              } else if (floored === 22) {
                ending = '<:28:814609640255258634>';
              } else if (floored === 23) {
                ending = '<:27:814609640142012436>';
              } else if (floored === 24) {
                ending = '<:26:814609639970832466>';
              } else if (floored === 25) {
                ending = '<:25:814609639915257888>';
              } else if (floored === 26) {
                ending = '<:24:814609640067039252>';
              } else if (floored === 27) {
                ending = '<:23:814609640209121310>';
              } else if (floored === 28) {
                ending = '<:22:814609640095612928>';
              } else if (floored === 29) {
                ending = '<:21:814609640025096253>';
              } else if (floored === 30) {
                ending = '<:20:814609640133492796>';
              } else if (floored === 31) {
                ending = '<:19:814609639692828724>';
              } else if (floored === 32) {
                ending = '<:18:814609640004124712>';
              } else if (floored === 33) {
                ending = '<:17:814609639622312037>';
              } else if (floored === 34) {
                ending = '<:16:814609640008450148>';
              } else if (floored === 35) {
                ending = '<:15:814609639563198465>';
              } else if (floored === 36) {
                ending = '<:14:814609639680507907>';
              } else if (floored === 37) {
                ending = '<:13:814609639621525525>';
              } else if (floored === 38) {
                ending = '<:12:814609639903068160>';
              } else if (floored === 39) {
                ending = '<:11:814609639949729832>';
              } else if (floored === 40) {
                ending = '<:10:814609639911718912>';
              } else if (floored === 41) {
                ending = '<:9_:814609639891140628>';
              } else if (floored === 42) {
                ending = '<:8_:814609639676575845>';
              } else if (floored === 43) {
                ending = '<:7_:814609639957856256>';
              } else if (floored === 44) {
                ending = '<:6_:814609639827177552>';
              } else if (floored === 45) {
                ending = '<:5_:814609639806861362>';
              } else if (floored === 46) {
                ending = '<:4_:814609639399358465>';
              } else if (floored === 47) {
                ending = '<:3_:814609639664517199>';
              } else if (floored === 48) {
                ending = '<:2_:814609639580368898>';
              } else if (floored === 49) {
                ending = '<:1_:814609639793754123>';
              } else if (floored > 49) {
                ending = '<:0_:814609639832289324>';
              }
              if (ending === '<:0_:814609639832289324>') {
                emote[j] = '<:tick:670163913370894346>';
              } else {
                emote[j] = '<a:loading:399267255839490051>';
              }
            }
            finish += ending;
            needed[j] = finish;
          }
          let loltext = `${360 - +participants} Spots left!`;
          if (participants > needed - 1) {
            loltext = 'More entries WOOH!';
          }
          const link = 'https://strms.net/888_WillisgamingtvDiscord';

          const e = new Builders.UnsafeEmbedBuilder()
            .setAuthor({
              name: 'Childe Giveaway! [You can also click here]',
              iconURL: 'https://i1.sndcdn.com/artworks-NbRgsD5ixh9PkxUR-t81Dyg-t500x500.jpg',
              url: link,
            })
            .setColor(client.constants.standard.color)
            .setDescription(
              `2 <:Childe:829744615909228546> Childe Giveaways + 1 more at 360 Participants (or 8000 <:primo:785890007058612254>)\n${needed[0]} ${emote[0]}\n${loltext}\n`,
            )
            .addFields({
              name: 'How to enter:',
              value:
                '- Simply just download and sign up **(18+)**\n- Post a screenshot of the screen shown below\n- Wait for a <@&293928278845030410> to approve your submission',
            })
            .addFields({
              name: '\u200b',
              value:
                'You can check if you are participating by sending \n`h!amiin` in <#336976743984267275>! \n(If you make a typo, just edit your message. I will still respond)',
            })
            .setImage(
              'https://cdn.discordapp.com/attachments/768559225538084874/829753503513444362/1111111111.png',
            )
            .setFooter({ text: 'Gambling can be addictive. Participation from the age of 18' })
            .addFields({ name: 'Current Participants:', value: participants });
          if (m.embeds[0].fields[1]) {
            if (`${m.embeds[0].fields[2].value}` !== `${participants}`) {
              m.client.ch.edit(m, { embeds: [e] });
            }
          } else {
            m.client.ch.edit(m, { embeds: [e] });
          }
        });
      }
    }
  },
};
