import type Eris from 'eris';
import constants from '../Other/Constants.json' assert { type: 'json' };

export default (member: Eris.Member | undefined | null) => {
  if (!member) return constants.standard.color;

  const highestRole = member.roles
    .map((id) => member.guild.roles.get(id))
    .sort((a, b) => Number(b?.position) - Number(a?.position))
    .pop();

  if (!highestRole) return constants.standard.color;

  return member && highestRole.color !== 0 ? highestRole.color : constants.standard.color;
};
