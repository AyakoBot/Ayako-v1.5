import type CT from '../../../typings/CustomTypings';

export default (msg: CT.Message) => {
  if (!msg.member) return;
  if (msg.channel.id !== '979811225212956722') return;
  if (
    !msg.member.roles.includes('293928278845030410') &&
    !msg.member.roles.includes('278332463141355520') &&
    msg.attachments.length === 0
  ) {
    msg.delete().catch(() => null);
  }
};
