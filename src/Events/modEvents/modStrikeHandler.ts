import type * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';
import type DBT from '../../typings/DataBaseTypings';
import type CT from '../../typings/CustomTypings';
import InteractionCollector from '../../BaseClient/Other/InteractionCollector';

export default async (
  executor: Eris.User,
  target: Eris.User,
  reason: string,
  cmd: CT.Message | CT.CommandInteraction,
  command?: CT.Command,
) => {
  const con = client.constants.mod.strike;
  const autopunish = await getAutoPunish(cmd);

  if (!autopunish || !autopunish.length) {
    const em: Eris.Embed = {
      type: 'rich',
      color: con.color,
      description: client.ch.stp(cmd.language.slashCommands.strike.notEnabled, {
        prefix: client.constants.standard.prefix,
      }),
    };

    client.ch.reply(cmd, { embeds: [em] }, cmd.language, command);
    return;
  }

  if (!cmd.guildID) return;
  const guild = client.guilds.get(cmd.guildID);
  if (!guild) return;

  const punishObj: CT.ModBaseEventOptions = {
    executor,
    target,
    reason,
    msg: cmd,
    guild,
    source: 'strike',
    type: 'warnAdd',
  };

  const existingWarns = (await getAllPunishments(cmd, target))?.flat(1) || [];
  const punishmentToApply = autopunish.find((p) => Number(p.warnamount) === existingWarns.length);

  if (!punishmentToApply) {
    client.emit('modBaseEvent', punishObj);
    return;
  }

  punishObj.duration = Number(punishmentToApply.duration || 60000);
  punishObj.type = getType(punishmentToApply);

  const confirmation = await getConfirmation(punishmentToApply, cmd);
  if (!confirmation) return;

  await doRoles(punishmentToApply, punishObj, cmd);

  client.emit('modBaseEvent', punishObj);
};

const doRoles = async (
  punishmentToApply: DBT.autopunish,
  punishObj: CT.ModBaseEventOptions,
  cmd: CT.Message | CT.CommandInteraction,
) => {
  if (!cmd.guildID) return;

  const member = await client.ch.getMember(punishObj.target.id, cmd.guildID);
  if (!member) return;

  if (punishmentToApply.removeroles?.length) {
    const rolesToRemove = member.roles.filter((r) => punishmentToApply.removeroles?.includes(r));
    await client.ch.roleManager.remove(member, rolesToRemove, punishObj.reason, 1);
  }

  if (punishmentToApply.addroles?.length) {
    const rolesToRemove = member.roles.filter((r) => punishmentToApply.addroles?.includes(r));
    await client.ch.roleManager.add(member, rolesToRemove, punishObj.reason, 1);
  }
};

const getConfirmation = async (
  punishmentToApply: DBT.autopunish,
  cmd: CT.Message | CT.CommandInteraction,
): Promise<boolean> => {
  if (!punishmentToApply.confirmationreq) return true;

  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.warning,
    description: cmd.language.slashCommands.strike.areYouSure,
    author: {
      name: cmd.language.slashCommands.strike.confirmAuthor,
      icon_url: client.constants.standard.error,
      url: client.constants.standard.invite,
    },
  };

  const m = await client.ch.reply(
    cmd,
    {
      ephemeral: true,
      embeds: [embed],
      components: client.ch.buttonRower([
        {
          type: 2,
          label: cmd.language.mod.warning.proceed,
          emoji: client.objectEmotes.tickWithBackground,
          custom_id: 'strike_proceed',
          style: 2,
        },
        {
          type: 2,
          label: cmd.language.mod.warning.abort,
          emoji: client.objectEmotes.crossWithBackground,
          custom_id: 'strike_abort',
          style: 3,
        },
      ]),
    },
    cmd.language,
  );

  if (!m) return false;

  const collector = new InteractionCollector(
    m,
    Number(punishmentToApply.punishmentawaittime || 20000),
  );

  return new Promise((res) => {
    collector.on('collect', (btn: Eris.ComponentInteraction) => {
      if (btn.data.custom_id === 'strike_proceed') res(true);
      if (btn.data.custom_id === 'strike_abort') {
        const abortEmbed = embed;

        embed.description = undefined;
        if (embed.author) {
          embed.author.name = cmd.language.Aborted;
          embed.author.icon_url = client.objectEmotes.cross.link;
        }

        btn.editParent({ embeds: [abortEmbed], components: [] });
        res(false);
      }
    });

    collector.on('end', (reason) => {
      if (reason === 'time') {
        res(true);
      }
    });
  });
};

const getType = (punishmentToApply: DBT.autopunish) => {
  switch (Number(punishmentToApply.punishment)) {
    case 0: {
      return 'tempmuteAdd';
    }
    case 1: {
      return 'kickAdd';
      break;
    }
    case 2: {
      return 'tempbanAdd';
      break;
    }
    case 3: {
      return 'banAdd';
      break;
    }
    case 5: {
      return 'tempchannelbanAdd';
      break;
    }
    case 6: {
      return 'channelbanAdd';
      break;
    }
    default: {
      return 'warnAdd';
      break;
    }
  }
};

const getAutoPunish = async (cmd: CT.Message | CT.CommandInteraction) =>
  client.ch
    .query(`SELECT * FROM autopunish WHERE guildid = $1 AND active = true;`, [cmd.guildID])
    .then((r: DBT.autopunish[] | null) => r);

const getAllPunishments = async (cmd: CT.CommandInteraction | CT.Message, target: Eris.User) =>
  client.ch
    .query(
      `SELECT * FROM punish_bans WHERE guildid = $1 AND userid = $2;
  SELECT * FROM punish_channelbans WHERE guildid = $1 AND userid = $2;
  SELECT * FROM punish_mutes WHERE guildid = $1 AND userid = $2;
  SELECT * FROM punish_kicks WHERE guildid = $1 AND userid = $2;
  SELECT * FROM punish_warns WHERE guildid = $1 AND userid = $2;`,
      [cmd.guildID, target.id],
    )
    .then(
      (
        r:
          | (
              | DBT.punish_bans[]
              | DBT.punish_channelbans[]
              | DBT.punish_kicks[]
              | DBT.punish_mutes[]
              | DBT.punish_warns[]
            )[]
          | null,
      ) => r,
    );
