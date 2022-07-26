import Jobs from 'node-schedule';
import type * as Eris from 'eris';
import type DBT from '../../typings/DataBaseTypings';

export default async (
  m: Eris.Message | null,
  source: string,
  settings?: DBT.antivirus,
  embed?: Eris.Embed,
) => {
  let minimizeTimeout = 0;
  let deleteTimeout = 0;

  switch (source) {
    case 'antivirus': {
      minimizeTimeout = Number(settings?.minimize);
      deleteTimeout = Number(settings?.delete);

      if (deleteTimeout <= minimizeTimeout) {
        Jobs.scheduleJob(new Date(Date.now() + deleteTimeout), () => {
          m?.delete().catch(() => null);
        });
      } else {
        if (embed && embed.fields?.[0].value) {
          embed.description = embed.fields?.[0].value;
          embed.fields = [];

          Jobs.scheduleJob(new Date(Date.now() + minimizeTimeout), () => {
            if (m) m.edit({ embeds: [embed] }).catch(() => null);
          });
        }

        Jobs.scheduleJob(new Date(Date.now() + deleteTimeout), () => {
          m?.delete().catch(() => null);
        });
      }

      break;
    }
    default: {
      break;
    }
  }
};
