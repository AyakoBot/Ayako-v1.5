import type Eris from 'eris';
import type DBT from '../../typings/DataBaseTypings';

export default (DBembed: DBT.customembeds): Eris.Embed => ({
  type: 'rich',
  color: Number(DBembed.color),
  title: DBembed.title,
  url: DBembed.url,
  author: DBembed.authorname
    ? {
        name: DBembed.authorname,
        icon_url: DBembed.authoriconurl,
        url: DBembed.authorurl,
      }
    : undefined,
  description: DBembed.description,
  thumbnail: {
    url: DBembed.thumbnail,
  },
  fields: DBembed.fieldnames
    ? DBembed.fieldnames.map((fieldName, i) => {
        const fieldValue = DBembed.fieldvalues?.[i] || '\u200b';
        const fieldInline = DBembed.fieldinlines?.[i] || '\u200b';
        return { name: fieldName, value: fieldValue, inline: !!fieldInline };
      })
    : undefined,
  image: {
    url: DBembed.image,
  },
  timestamp: DBembed.timestamp ? new Date(DBembed.timestamp) : undefined,
  footer: DBembed.footertext
    ? {
        text: DBembed.footertext,
        icon_url: DBembed.footericonurl,
      }
    : undefined,
});
